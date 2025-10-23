import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import db from "@/db/db";
import { formatCurrency, formatNumber } from "@/lib/formatters";

async function getSalesData() {
  const data = await db.order.aggregate({
    _sum: { pricePaidInCents: true },
    _count: true,
  });
  await wait(2000);
  return {
    amount: (data._sum.pricePaidInCents || 0) / 100,
    numberOfSales: data._count,
  };
}

async function getUserData() {
  const [userCount, orderData] = await Promise.all([
    db.user.count(),
    db.order.aggregate({
      _sum: { pricePaidInCents: true },
    }),
  ]);
  return {
    userCount,
    averageValuePerUser:
      userCount === 0
        ? 0
        : (orderData._sum.pricePaidInCents || 0) / userCount / 100,
  };
}

async function getProductData() {
  const [activeCount, inactiveCount] = await Promise.all([
    db.product.count({ where: { isAvailableForPurchase: true } }),
    db.product.count({ where: { isAvailableForPurchase: false } }),
  ]);
  return {
    activeCount,
    inactiveCount,
  };
}
function wait(duration: number) {
  return new Promise((resolve) => setTimeout(resolve, duration));
}
export default async function AdminDashbord() {
  const [salesData, userData, productData] = await Promise.all([
    getSalesData(),
    getUserData(),
    getProductData(),
  ]);

  return (
    <div className="px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <CardDashboard
        className=" backdrop-blur-md bg-white/20 border border-black/20 rounded-2xl shadow-lg"
        title="Sales"
        description={`${formatNumber(salesData.numberOfSales)} Number of Order`}
        content={`Total Sales: ${formatCurrency(salesData.amount)}`}
      />
      <CardDashboard
        className=" backdrop-blur-md bg-white/20 border border-black/20 rounded-2xl shadow-lg"
        title="Customers"
        description={formatCurrency(userData.averageValuePerUser)}
        content={`${formatNumber(userData.userCount)} Number of Customer`}
      />
      <CardDashboard
        className=" backdrop-blur-md bg-white/20 border border-black/20 rounded-2xl shadow-lg"
        title="Active Products"
        description={`${formatNumber(productData.inactiveCount)} Inactive`}
        content={`${formatNumber(productData.activeCount)} Active`}
      />
    </div>
  );
}
type CardDashboardProps = {
  title: string;
  description: string;
  content: string;
  className: string;
};

function CardDashboard({
  className,
  title,
  description,
  content,
}: CardDashboardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>{content}</p>
      </CardContent>
    </Card>
  );
}
