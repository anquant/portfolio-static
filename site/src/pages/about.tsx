import { aboutProps } from '@/lib/page-props';
import AboutPage from '@/views/AboutPage';

export default AboutPage;

export const getStaticProps = aboutProps('ru');
