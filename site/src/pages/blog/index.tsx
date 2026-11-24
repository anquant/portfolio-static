import { blogProps } from '@/lib/page-props';
import BlogPage from '@/views/BlogPage';

export default BlogPage;

export const getStaticProps = blogProps('ru');
