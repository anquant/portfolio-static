import { contactsProps } from '@/lib/page-props';
import ContactsPage from '@/views/ContactsPage';

export default ContactsPage;

export const getStaticProps = contactsProps('en');
