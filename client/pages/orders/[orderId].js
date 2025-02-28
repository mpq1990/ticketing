import { useEffect, useState } from 'react';
import Router from 'next/router';
import buildClient from '../../api/build-client';
import StripeCheckout from 'react-stripe-checkout';
import useRequest from '../../hooks/use-request';

const OrderShow = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const { doRequest, errors } = useRequest({
    url: '/api/payments',
    method: 'post',
    body: { orderId: order.id },
    onSuccess: () => Router.push('/orders'),
  });

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft / 1000));
    };
    findTimeLeft();
    const timerId = setInterval(findTimeLeft, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, []);

  if (timeLeft < 0) {
    return <div>Order Expired</div>;
  }

  return (
    <div>
      {timeLeft} seconds until order expires
      <StripeCheckout
        token={({ id }) => {
          doRequest({ token: id });
        }}
        stripeKey='pk_test_51IK57CFvk3FcxAXVh4jm7QLNbLziGsJ0sRRCo2rZ9nA1y13l7YBNRvtJ5hlnkElXl0BouuV48Grle2Ju6yraLS7k00CXx8mniu'
        amount={order.ticket.price * 100}
        email={currentUser.email}
      />
      {errors}
    </div>
  );
};

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;
  const { data } = await buildClient(context, 'http://orders-svc:3000').get(
    `/api/orders/${orderId}`
  );
  return { order: data };
};

export default OrderShow;
