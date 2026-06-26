import { ArticleDetailPage } from './ArticleDetailContent'

export const dynamic = 'force-dynamic'

export default async function ArticleDetail(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  return <ArticleDetailPage id={id} />
}
