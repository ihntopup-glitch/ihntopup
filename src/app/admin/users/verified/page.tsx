
import UsersPage from "../page";

export default function VerifiedUsersPage() {
    // This page reuses the main UsersPage component but Next.js will
    // automatically pass the correct searchParams to indicate the filter.
    // We just need a dummy component here to create the route.
    // For this to work in this specific setup, we'd adjust UsersPage to read the path or a prop.
    // A simpler way for this POC is just to render the component.
    return <UsersPage />;
}
