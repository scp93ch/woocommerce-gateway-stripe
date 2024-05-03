<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * The Afterpay / Clearpay Payment Method class extending UPE base class
 */
class WC_Stripe_UPE_Payment_Method_Afterpay_Clearpay extends WC_Stripe_UPE_Payment_Method {

	const STRIPE_ID = 'afterpay_clearpay';

	/**
	 * Constructor for afterpay / clearpay payment method
	 */
	public function __construct() {
		parent::__construct();

		$this->stripe_id                    = self::STRIPE_ID;
		$this->title                        = __( 'Clearpay / Afterpay', 'woocommerce-gateway-stripe' );
		$this->is_reusable                  = false;
		$this->supported_currencies         = [ 'USD', 'CAD', 'GBP', 'AUD', 'NZD' ];
		$this->supported_countries          = [ 'AU', 'CA', 'GB', 'NZ', 'US' ];
		$this->accept_only_domestic_payment = true;
		$this->label                        = __( 'Clearpay / Afterpay', 'woocommerce-gateway-stripe' );
		$this->description                  = __(
			'Allow customers to pay over time with Clearpay / Afterpay.',
			'woocommerce-gateway-stripe'
		);
		$this->limits_per_currency          = [
			'AU' => [
				'AUD' => [
					'min' => 100,
					'max' => 200000,
				], // Represents AUD 100 - 2,000 AUD.
			],
			'CA' => [
				'CAD' => [
					'min' => 100,
					'max' => 200000,
				], // Represents CAD 100 - 2,000 CAD.
			],
			'NZ' => [
				'NZD' => [
					'min' => 100,
					'max' => 200000,
				], // Represents NZD 100 - 2,000 NZD.
			],
			'GB' => [
				'GBP' => [
					'min' => 100,
					'max' => 120000,
				], // Represents GBP 100 - 1,200 GBP.
			],
			'US' => [
				'USD' => [
					'min' => 100,
					'max' => 400000,
				], // Represents USD 100 - 4,000 USD.
			],
		];
	}

	/**
	 * Returns payment method title
	 *
	 * @param array|bool $payment_details Optional payment details from charge object.
	 *
	 * @return string
	 */
	public function get_title( $payment_details = false ) {
		if ( $this->is_gb_country() ) {
			return __( 'Clearpay', 'woocommerce-gateway-stripe' );
		}
		return __( 'Afterpay', 'woocommerce-gateway-stripe' );
	}

	/**
	 * /**
	 *  Return the gateway's description.
	 *
	 * @return string
	 */
	public function get_description( $payment_details = false ) {
		if ( $this->is_gb_country() ) {
			return __(
				'Allow customers to pay over time with Clearpay.',
				'woocommerce-gateway-stripe'
			);
		}
		return __(
			'Allow customers to pay over time with Afterpay.',
			'woocommerce-gateway-stripe'
		);
	}

	/**
	 * Returns true if the Stripe account country is GB
	 *
	 * @return boolean
	 */
	private function is_gb_country() {
		$cached_account_data = WC_Stripe::get_instance()->account->get_cached_account_data();
		$account_country     = $cached_account_data['country'] ?? null;
		return 'GB' === $account_country;
	}

	/**
	 * Returns whether the payment method is available for the Stripe account's country.
	 *
	 * Afterpay / Clearpay is only available for domestic transactions in the United States, Canada, Australia, New Zealand, and the United Kingdom.
	 *
	 * @return bool True if the payment method is available for the account's country, false otherwise.
	 */
	public function is_available_for_account_country() {
		return in_array( WC_Stripe::get_instance()->account->get_account_country(), $this->supported_countries, true );
	}
}
