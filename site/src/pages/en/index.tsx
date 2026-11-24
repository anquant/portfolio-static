import { homeProps } from '@/lib/page-props';
import HomePage from '@/views/HomePage';

export default HomePage;

export const getStaticProps = homeProps('en');
