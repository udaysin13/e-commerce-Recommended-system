"use client";

import type { CheckoutAddress } from "@/types/order";

type AddressField = keyof CheckoutAddress;

type Props = {
  address: CheckoutAddress;
  errors: Partial<Record<AddressField, string>>;
  onChange: (field: AddressField, value: string) => void;
  disabled?: boolean;
};

const fieldClassName =
  "mt-2 min-h-11 w-full rounded border border-line px-4 py-3 outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/15";

export const CheckoutAddressForm = ({
  address,
  errors,
  onChange,
  disabled = false,
}: Props) => {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase text-teal">Delivery details</p>
        <h2 className="mt-2 text-2xl font-bold text-ink">Delivery address</h2>
        <p className="mt-2 text-sm text-ink/65">
          We need a complete address before an order can be placed.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-ink">
          Full Name
          <input
            type="text"
            value={address.fullName}
            onChange={(event) => onChange("fullName", event.target.value)}
            disabled={disabled}
            className={fieldClassName}
            placeholder="Ada Lovelace"
          />
          {errors.fullName ? <p className="mt-1 text-xs text-red-600">{errors.fullName}</p> : null}
        </label>

        <label className="block text-sm font-semibold text-ink">
          Phone Number
          <input
            type="tel"
            value={address.phone}
            onChange={(event) => onChange("phone", event.target.value)}
            disabled={disabled}
            className={fieldClassName}
            placeholder="+91 98765 43210"
          />
          {errors.phone ? <p className="mt-1 text-xs text-red-600">{errors.phone}</p> : null}
        </label>
      </div>

      <label className="block text-sm font-semibold text-ink">
        Address Line 1
        <input
          type="text"
          value={address.addressLine1}
          onChange={(event) => onChange("addressLine1", event.target.value)}
          disabled={disabled}
          className={fieldClassName}
          placeholder="House number, street, area"
        />
        {errors.addressLine1 ? (
          <p className="mt-1 text-xs text-red-600">{errors.addressLine1}</p>
        ) : null}
      </label>

      <label className="block text-sm font-semibold text-ink">
        Address Line 2 <span className="font-normal text-ink/55">(Optional)</span>
        <input
          type="text"
          value={address.addressLine2}
          onChange={(event) => onChange("addressLine2", event.target.value)}
          disabled={disabled}
          className={fieldClassName}
          placeholder="Apartment, suite, landmark"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-ink">
          City
          <input
            type="text"
            value={address.city}
            onChange={(event) => onChange("city", event.target.value)}
            disabled={disabled}
            className={fieldClassName}
            placeholder="Bengaluru"
          />
          {errors.city ? <p className="mt-1 text-xs text-red-600">{errors.city}</p> : null}
        </label>

        <label className="block text-sm font-semibold text-ink">
          State
          <input
            type="text"
            value={address.state}
            onChange={(event) => onChange("state", event.target.value)}
            disabled={disabled}
            className={fieldClassName}
            placeholder="Karnataka"
          />
          {errors.state ? <p className="mt-1 text-xs text-red-600">{errors.state}</p> : null}
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-ink">
          Postal Code
          <input
            type="text"
            value={address.postalCode}
            onChange={(event) => onChange("postalCode", event.target.value)}
            disabled={disabled}
            className={fieldClassName}
            placeholder="560001"
          />
          {errors.postalCode ? (
            <p className="mt-1 text-xs text-red-600">{errors.postalCode}</p>
          ) : null}
        </label>

        <label className="block text-sm font-semibold text-ink">
          Country
          <input
            type="text"
            value={address.country}
            onChange={(event) => onChange("country", event.target.value)}
            disabled={disabled}
            className={fieldClassName}
            placeholder="India"
          />
          {errors.country ? <p className="mt-1 text-xs text-red-600">{errors.country}</p> : null}
        </label>
      </div>
    </div>
  );
};
