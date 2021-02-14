import buildClient from '../../api/build-client';

const OrderIndex = ({ orders }) => {
  return (
    <ul>
      {orders.map((order) => {
        return (
          <li key={order.id}>
            {order.ticket.title} - {order.status}
          </li>
        );
      })}
    </ul>
  );
};

OrderIndex.getInitialProps = async (context, client) => {
  const { data } = await buildClient(context, 'http://orders-svc:3000').get(
    '/api/orders'
  );
  return { orders: data };
};

export default OrderIndex;
