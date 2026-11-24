import { articlePaths, articleProps } from '@/lib/page-props';
import ArticlePage from '@/views/ArticlePage';

export default ArticlePage;

export const getStaticPaths = articlePaths('ru');
export const getStaticProps = articleProps('ru');
