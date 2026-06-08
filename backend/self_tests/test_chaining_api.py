#!/usr/bin/env python3
import uuid
import time
from app.models.job import Job
from app.models.task import Task
from app.db.session import SessionLocal
from app.queue.factory import get_normal_queue_client

def create_normal_job(db, name: str, next_job_id: str = None) -> str:
    """直接寫入資料庫建立一個沒有定時機制的 Normal Job"""
    job_id = uuid.uuid4()  # 必須傳入 UUID 物件，不然 SQLAlchemy ORM 會對比失敗
    job = Job(
        id=job_id,
        name=name,
        action_type="shell",
        action_config={"command": f"echo 'Executing {name}' && sleep 2"},
        runtime_spec={
            "image": "alpine:3.20",
            "command": ["sh", "-c", f"echo 'Executing {name}' && sleep 2"]
        },
        enabled=True,
        concurrency_policy="allow",
        max_retries=0,
        job_type="normal", # 改為 normal
        cron_expression=None, # 沒有 cron
        next_fire_at=None,
        next_job_id=next_job_id
    )
    db.add(job)
    print(f"[SUCCESS] Created {name} with ID: {job_id}")
    return job_id

def main():
    print("=== Start creating A -> B -> C (Normal Job) ===")
    
    with SessionLocal() as db:
        # 1. 建立 Job C
        job_c_id = create_normal_job(db, name=f"Normal-Job-C-{int(time.time())}")
        
        # 2. 建立 Job B (指向 C)
        job_b_id = create_normal_job(db, name=f"Normal-Job-B-{int(time.time())}", next_job_id=job_c_id)
        
        # 3. 建立 Job A (指向 B)
        job_a_id = create_normal_job(db, name=f"Normal-Job-A-{int(time.time())}", next_job_id=job_b_id)
        
        print("\nManually triggering Job A...")
        # 建立一筆 Task
        task_a = Task(
            job_id=job_a_id,
            status="pending",
            trigger_type="manual",
            retry_count=0
        )
        db.add(task_a)
        db.commit()
        
        # 將 Task ID 推送給 Worker 的 Queue
        from app.core.config import get_settings
        settings = get_settings()
        settings.sqs_endpoint_url = "http://localhost:4566"  # 強制覆蓋為本機位置，避免吃錯設定
        
        queue = get_normal_queue_client()
        queue.send_task(str(task_a.id))
        print(f"[PUSHED] Task (ID: {task_a.id}) is pushed to Worker!")
        
        print("\n[WAITING] Waiting for Worker to finish and fetching result...")
        # 輪詢資料庫看結果
        for _ in range(10):
            time.sleep(1)
            db.refresh(task_a)
            if task_a.status in ("success", "failed", "final_failed"):
                break
                
        print("===============================================")
        print(f"Task Final Status: {task_a.status}")
        print(f"Task stdout:\n{task_a.stdout}")
        print(f"Task stderr:\n{task_a.stderr}")
        print("===============================================")
    
    print("\n[DONE] Script finished.")

if __name__ == "__main__":
    main()
