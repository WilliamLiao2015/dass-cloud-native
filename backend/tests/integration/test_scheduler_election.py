import threading
import time
import pytest
from sqlalchemy import create_engine, text


def test_scheduler_leader_election(main_engine):
    """
    測試 PostgreSQL Session-Level Advisory Lock 的行為
    db_engine 應該要是你的 test fixture 提供的測試資料庫 engine
    """
    LOCK_KEY = 999999
    results = {}

    from sqlalchemy.pool import NullPool
    # 模擬 Scheduler 1 (跑得快，成為 Leader)
    def run_scheduler_1():
        # 建立獨立的長連線 (使用 NullPool 確保連線在 with block 結束時立刻斷開，模擬 Crash)
        engine = create_engine(main_engine.url, poolclass=NullPool)
        with engine.connect() as conn:
            is_leader = conn.execute(
                text("SELECT pg_try_advisory_lock(:key)"), {"key": LOCK_KEY}
            ).scalar()

            results["s1_is_leader"] = is_leader

            if is_leader:
                # 模擬持鎖工作中... (刻意 sleep 等待 Scheduler 2 來搶)
                time.sleep(2)
        # 離開 with block，連線關閉，鎖應該要自動釋放！

    # 模擬 Scheduler 2 (跑得慢，一開始是 Standby，後來接手)
    def run_scheduler_2():
        engine = create_engine(main_engine.url, poolclass=NullPool)
        with engine.connect() as conn:
            # 第一次搶鎖 (此時 S1 還持著鎖)
            first_try = conn.execute(
                text("SELECT pg_try_advisory_lock(:key)"), {"key": LOCK_KEY}
            ).scalar()
            results["s2_first_try"] = first_try

            # 等待 S1 結束工作並關閉連線 (S1 sleep 2 秒，所以 S2 等 3 秒確保 S1 死透)
            time.sleep(3)

            # 第二次搶鎖 (S1 已經斷線，鎖應該空出來了)
            second_try = conn.execute(
                text("SELECT pg_try_advisory_lock(:key)"), {"key": LOCK_KEY}
            ).scalar()
            results["s2_second_try"] = second_try

    # 1. 建立執行緒
    t1 = threading.Thread(target=run_scheduler_1)
    t2 = threading.Thread(target=run_scheduler_2)

    # 2. 讓 S1 先跑，保證它先搶到鎖
    t1.start()
    time.sleep(0.5)

    # 3. 讓 S2 接著跑
    t2.start()

    # 4. 等待兩個執行緒都執行完畢
    t1.join()
    t2.join()

    # 5. 驗證結果！
    assert results["s1_is_leader"] is True, "S1 should get LOCK_KEY"
    assert results["s2_first_try"] is False, "S2 should not get LOCK_KEY"
    assert (
        results["s2_second_try"] is True
    ), "S1 is disconnected, S2 should get LOCK_KEY"
