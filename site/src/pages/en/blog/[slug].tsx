import { articlePaths, articleProps } from '@/lib/page-props';
import ArticlePage from '@/views/ArticlePage';

export default ArticlePage;

export const getStaticPaths = articlePaths('en');
export const getStaticProps = articleProps('en');
