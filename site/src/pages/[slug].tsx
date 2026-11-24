import { workPaths, workProps } from '@/lib/page-props';
import WorkPage from '@/views/WorkPage';

export default WorkPage;

export const getStaticPaths = workPaths('ru');
export const getStaticProps = workProps('ru');
