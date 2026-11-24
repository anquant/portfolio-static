import { servicePaths, serviceProps } from '@/lib/page-props';
import ServicePage from '@/views/ServicePage';

export default ServicePage;

export const getStaticPaths = servicePaths('ru');
export const getStaticProps = serviceProps('ru');
