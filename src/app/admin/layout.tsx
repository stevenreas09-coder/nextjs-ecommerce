import { Nav, NavLink } from "@/components/Nav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Nav>
        <NavLink href="/admin">Dashboard</NavLink>
        <NavLink href="/admin/users">Customer</NavLink>
        <NavLink href="/admin/products">Products</NavLink>
        <NavLink href="/admin/order">Sales</NavLink>
      </Nav>
      <div className="w-screen flex justify-center">
        <div className="container m-6 max-h-[100vh]">{children}</div>
      </div>
    </div>
  );
}
