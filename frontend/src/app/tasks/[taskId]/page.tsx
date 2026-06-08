import TaskDetailPage from "../_components/task-detail-page"

export default async function TaskDetailRoute({
  params,
}: {
  params: Promise<{ taskId: string }>
}) {
  const { taskId } = await params

  return <TaskDetailPage taskId={taskId} />
}
