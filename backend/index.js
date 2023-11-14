const express = require("express")
const app = express();
require('dotenv').config()
const cors=require("cors");
const bodyParser = require('body-parser');
const stripe = require('stripe')(process.env.API_KEY);
const port = process.env.PORT;
const hostname = process.env.HOSTNAME;


const corsOptions ={
   origin:'*', 
   credentials:true,            //access-control-allow-credentials:true
   optionSuccessStatus:200,
}

app.use(cors(corsOptions)) 
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


app.get('/', (req, res) =>{
   console.log("Server is running");
   res.status(200).json({ status : 200, msg : "Server is running" });
})


app.post('/create-customer', async ( req, res ) => { 
      // console.log(req.body);
    // params value come in req method
      const { name, email } = req.body;
      const params = {
        name : name,
        email: email,
      }

      const customer = await stripe.customers.create(params);
      res.status(200).json({ status : 200, msg : customer})
})


app.get('/create-payment', async (req, res) => {
    // Create a PaymentIntent with the amount, currency, and a payment method type.
 
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        currency: 'EUR',
        amount: 1999,
        //automatic_payment_methods: { enabled: true, allow_redirects : `never` },  
        payment_method_types: ['card'],
        metadata: {
            order_id: '6735',
          },    
      });
     
      // To create a PaymentIntent for confirmation, see our guide at: https://stripe.com/docs/payments/payment-intents/creating-payment-intents#creating-for-automatic
        // const confirmPaymentIntent = await stripe.paymentIntents.confirm(
        //     paymentIntent.id,
        //     {payment_method: 'pm_card_visa'}
        // );
       // console.log(confirmPaymentIntent);
      // Send publishable key and PaymentIntent details to client
      res.send({
        clientSecret: paymentIntent,
      });
    } catch (e) {
      return res.status(400).send({
        error: {
          message: e.message,
        },
      });
    }
  });




app.get('/add-card', async ( req, res) => {
    // params require customer id, source is object with card data 
    const card = await stripe.customers.createSource(
        'cus_OyjkVr8eDtvgbW',
        // {
        //  object : 'card',
        //  number: 4242424242424242,
        //  exp_month : 12,
        //  exp_year : 2025,
        //  name : "rgHanks"
        // }
        {source: 'tok_amex'}
      );

    return res.status(200).send({
        msg : card
      });
})


app.listen(port ,hostname ,()=>{
    console.log(`Server running at http://${hostname}:${port}/`);
})