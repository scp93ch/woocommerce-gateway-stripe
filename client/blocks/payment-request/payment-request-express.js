/**
 * External dependencies
 */
import {
	Elements,
	PaymentRequestButtonElement,
	useStripe,
} from '@stripe/react-stripe-js';

/**
 * Internal dependencies
 */
import { getStripeServerData } from '../stripe-utils';
import { GooglePayButton, shouldUseGooglePayBrand } from './branded-buttons';
import { CustomButton } from './custom-button';
import {
	usePaymentRequest,
	useProcessPaymentHandler,
	useShippingAddressUpdateHandler,
	useShippingOptionChangeHandler,
	useOnClickHandler,
	useCancelHandler,
} from './hooks';

/**
 * @typedef {import('../stripe-utils/type-defs').Stripe} Stripe
 * @typedef {import('../stripe-utils/type-defs').StripePaymentRequest} StripePaymentRequest
 * @typedef {import('@woocommerce/type-defs/registered-payment-method-props').RegisteredPaymentMethodProps} RegisteredPaymentMethodProps
 */

/**
 * @typedef {Object} WithStripe
 *
 * @property {Stripe} [stripe] Stripe api (might not be present)
 */

/**
 * @typedef {RegisteredPaymentMethodProps & WithStripe} StripeRegisteredPaymentMethodProps
 */

/**
 * PaymentRequestExpressComponent
 *
 * @param {StripeRegisteredPaymentMethodProps} props Incoming props
 */
const PaymentRequestExpressComponent = ( {
	billing,
	shippingData,
	onClick,
	onClose,
	setExpressPaymentError,
} ) => {
	const stripe = useStripe();
	const {
		setShippingAddress,
		setSelectedRates,
		needsShipping,
	} = shippingData;

	/* Set up payment request and its event handlers. */
	const [ paymentRequest, paymentRequestType ] = usePaymentRequest(
		stripe,
		needsShipping
	);
	useShippingAddressUpdateHandler(
		paymentRequest,
		paymentRequestType,
		setShippingAddress
	);
	useShippingOptionChangeHandler(
		paymentRequest,
		paymentRequestType,
		setSelectedRates
	);
	useProcessPaymentHandler(
		stripe,
		paymentRequest,
		paymentRequestType,
		setExpressPaymentError
	);
	const onPaymentRequestButtonClick = useOnClickHandler(
		paymentRequest,
		setExpressPaymentError,
		onClick,
		billing
	);
	useCancelHandler( paymentRequest, onClose );

	// locale is not a valid value for the paymentRequestButton style.
	// Make sure `theme` defaults to 'dark' if it's not found in the server provided configuration.
	const {
		type = 'default',
		theme = 'dark',
		height = '48',
	} = getStripeServerData().button;

	const paymentRequestButtonStyle = {
		paymentRequestButton: {
			type,
			theme,
			height: `${ height }px`,
		},
	};

	// Use pre-blocks settings until we merge the two distinct settings objects.
	/* global wc_stripe_payment_request_params */
	const isBranded = wc_stripe_payment_request_params.button.is_branded;
	const brandedType = wc_stripe_payment_request_params.button.branded_type;
	const isCustom = wc_stripe_payment_request_params.button.is_custom;

	if ( ! paymentRequest ) {
		return null;
	}

	if ( isCustom ) {
		return (
			<CustomButton
				onButtonClicked={ () => {
					onPaymentRequestButtonClick();
					// Since we're using a custom button we must manually trigger the payment
					// request dialog.
					paymentRequest.show();
				} }
			/>
		);
	}

	if ( isBranded && shouldUseGooglePayBrand() ) {
		return (
			<GooglePayButton
				onButtonClicked={ () => {
					onPaymentRequestButtonClick();
					// Since we're using a custom button we must manually trigger the payment
					// request dialog.
					paymentRequest.show();
				} }
			/>
		);
	}

	if ( isBranded ) {
		// Not implemented branded buttons default to Stripe's button.
		// Apple Pay buttons can also fall back to Stripe's button, as it's already branded.
		// Set button type to default or buy, depending on branded type, to avoid issues with Stripe.
		paymentRequestButtonStyle.paymentRequestButton.type =
			brandedType === 'long' ? 'buy' : 'default';
	}

	return (
		<PaymentRequestButtonElement
			onClick={ onPaymentRequestButtonClick }
			options={ {
				// @ts-ignore
				style: paymentRequestButtonStyle,
				// @ts-ignore
				paymentRequest,
			} }
		/>
	);
};

/**
 * PaymentRequestExpress with stripe provider
 *
 * @param {StripeRegisteredPaymentMethodProps} props
 */
export const PaymentRequestExpress = ( props ) => {
	const { stripe } = props;
	return (
		<Elements stripe={ stripe }>
			<PaymentRequestExpressComponent { ...props } />
		</Elements>
	);
};