import { servicesProps } from '@/lib/page-props';
import ServicesPage from '@/views/ServicesPage';

export default ServicesPage;

export const getStaticProps = servicesProps('en');
