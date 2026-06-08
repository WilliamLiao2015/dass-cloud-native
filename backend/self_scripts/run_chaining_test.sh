#!/bin/bash
set -e

echo "==============================================="
echo "   準備 Docker 環境與 Dependency Chaining 測試"
echo "==============================================="

# 取得腳本所在的絕對路徑，並跳到專案根目錄 (DASS/)
cd "$(dirname "$0")/../.."

# 確保所有服務都跑著 (不會清空資料庫，也不會停掉 Worker)
# 因為我們的測試需要 Worker 實際去執行 Job A 並回報成功，Scheduler 才能繼續觸發 Job B！
# 這裡我們明確指定只啟動後端核心服務，跳過 traefik 與 frontend，避免不相關的報錯
docker compose -f docker-compose.yml up -d --build postgres localstack pgbouncer scheduler worker

echo "==============================================="
echo "   等待服務就緒... (3秒)"
echo "==============================================="
sleep 3

# 切換到 backend/self_tests 資料夾
cd backend/self_tests

# 執行 chaining 測試腳本
# 這裡必須注入本機可訪問的 DATABASE_URL 以及 SQS_ENDPOINT_URL
DASS_DATABASE_URL="postgresql+psycopg://dass:dass@localhost:5432/dass" \
DASS_SQS_ENDPOINT_URL="http://localhost:4566" \
uv run python test_chaining_api.py

echo "==============================================="
echo "   測試資料已寫入資料庫！"
echo "   請執行以下指令觀察連鎖反應："
echo "   docker compose logs -f scheduler worker"
echo "==============================================="
