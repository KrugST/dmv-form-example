import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import './App.css';

type FormState = {
  vehicle: {
    licensePlate: string;
    make: string;
    vin: string;
    dpNumber: string;
    engineNumber: string;
  };
  owner: {
    trueFullName: string;
    dlNumber: string;
    coOwnerName: string;
    coOwnerDlNumber: string;
    birthDate: string;
  };
  address: {
    physicalAddress: string;
    apartment: string;
    city: string;
    state: string;
    zipCode: string;
    county: string;
    mailingAddress: string;
    mailingApartment: string;
    mailingCity: string;
    mailingState: string;
    mailingZipCode: string;
  };
  contact: {
    email: string;
    areaCode: string;
    phoneNumber: string;
  };
  requestedItems: {
    licensePlates: boolean;
    regCard: boolean;
    licenseYearSticker: boolean;
    licenseMonthSticker: boolean;
    vesselYearSticker: boolean;
    vesselCert: boolean;
    musselFeeSticker: boolean;
    dpPlacard: boolean;
    dpIdCard: boolean;
    pnoCard: boolean;
    pfrSticker: boolean;
    cvraWeightDecal: boolean;
    cvraYearSticker: boolean;
    trailerOhvId: boolean;
  };
  reason: {
    lost: boolean;
    stolen: boolean;
    destroyed: boolean;
    notReceivedFromDmv: boolean;
    notReceivedFromPriorOwner: boolean;
    surrendered: boolean;
  };
  replacementCount: {
    onePlate: boolean;
    twoPlates: boolean;
    oneLicensePlate: boolean;
    twoLicensePlates: boolean;
  };
  additionalRequest: {
    specialPlates: boolean;
    regCardWithCurrentAddress: boolean;
    cvc5202Compliance: boolean;
    other: boolean;
    explanation: string;
  };
  certification: {
    signature: string;
    title: string;
    date: string;
  };
};

const initialForm: FormState = {
  vehicle: {
    licensePlate: '',
    make: '',
    vin: '',
    dpNumber: '',
    engineNumber: '',
  },
  owner: {
    trueFullName: '',
    dlNumber: '',
    coOwnerName: '',
    coOwnerDlNumber: '',
    birthDate: '',
  },
  address: {
    physicalAddress: '',
    apartment: '',
    city: '',
    state: 'CA',
    zipCode: '',
    county: '',
    mailingAddress: '',
    mailingApartment: '',
    mailingCity: '',
    mailingState: '',
    mailingZipCode: '',
  },
  contact: {
    email: '',
    areaCode: '',
    phoneNumber: '',
  },
  requestedItems: {
    licensePlates: false,
    regCard: false,
    licenseYearSticker: false,
    licenseMonthSticker: false,
    vesselYearSticker: false,
    vesselCert: false,
    musselFeeSticker: false,
    dpPlacard: false,
    dpIdCard: false,
    pnoCard: false,
    pfrSticker: false,
    cvraWeightDecal: false,
    cvraYearSticker: false,
    trailerOhvId: false,
  },
  reason: {
    lost: false,
    stolen: false,
    destroyed: false,
    notReceivedFromDmv: false,
    notReceivedFromPriorOwner: false,
    surrendered: false,
  },
  replacementCount: {
    onePlate: false,
    twoPlates: false,
    oneLicensePlate: false,
    twoLicensePlates: false,
  },
  additionalRequest: {
    specialPlates: false,
    regCardWithCurrentAddress: false,
    cvc5202Compliance: false,
    other: false,
    explanation: '',
  },
  certification: {
    signature: '',
    title: '',
    date: '',
  },
};

const requestedItemLabels: Record<keyof FormState['requestedItems'], string> = {
  licensePlates: 'License Plates',
  regCard: 'Registration Card',
  licenseYearSticker: 'License Year Sticker',
  licenseMonthSticker: 'License Month Sticker',
  vesselYearSticker: 'Vessel Year Sticker',
  vesselCert: 'Vessel Certificate',
  musselFeeSticker: 'Mussel Fee Sticker',
  dpPlacard: 'DP Placard',
  dpIdCard: 'DP ID Card',
  pnoCard: 'PNO Card',
  pfrSticker: 'PFR Sticker',
  cvraWeightDecal: 'CVRA Weight Decal',
  cvraYearSticker: 'CVRA Year Sticker',
  trailerOhvId: 'Trailer/OHV ID',
};

const reasonLabels: Record<keyof FormState['reason'], string> = {
  lost: 'Lost',
  stolen: 'Stolen',
  destroyed: 'Destroyed',
  notReceivedFromDmv: 'Not Received from DMV',
  notReceivedFromPriorOwner: 'Not Received from Prior Owner',
  surrendered: 'Surrendered',
};

const replacementCountLabels: Record<keyof FormState['replacementCount'], string> = {
  onePlate: 'One Plate',
  twoPlates: 'Two Plates',
  oneLicensePlate: 'One License Plate',
  twoLicensePlates: 'Two License Plates',
};

const additionalRequestLabels: Record<
  Exclude<keyof FormState['additionalRequest'], 'explanation'>,
  string
> = {
  specialPlates: 'Special Plates',
  regCardWithCurrentAddress: 'REG Card with Current Address',
  cvc5202Compliance: 'CVC 5202 Compliance',
  other: 'Other',
};

function App() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [mailingSameAsPhysical, setMailingSameAsPhysical] = useState(false);

  const apiBaseUrl = useMemo(
    () => import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000',
    [],
  );

  const requiredInvalid = (value: string) => value.trim().length === 0;
  const isUsDate = (value: string) =>
    /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/.test(value);
  const formatDateInput = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 2) {
      return digits;
    }
    if (digits.length <= 4) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  };
  const toPhoneDigits = (value: string) => value.replace(/\D/g, '').slice(0, 10);
  const formatPhoneDisplay = (digits: string) => {
    if (!digits) {
      return '';
    }
    if (digits.length <= 3) {
      return `(${digits}`;
    }
    if (digits.length <= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    }
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };
  const splitPhoneFromCombined = (value: string) => {
    const digits = toPhoneDigits(value);
    const areaCode = digits.slice(0, 3);
    const localDigits = digits.slice(3, 10);
    const phoneNumber =
      localDigits.length > 3
        ? `${localDigits.slice(0, 3)}-${localDigits.slice(3)}`
        : localDigits;
    return { areaCode, phoneNumber };
  };
  const sanitizeZipInput = (value: string) => value.replace(/\D/g, '').slice(0, 5);
  const sanitizeStateInput = (value: string) =>
    value.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 2);
  const sanitizeEmailInput = (value: string) =>
    value.replace(/\s/g, '').toLowerCase().slice(0, 120);

  const setField = <S extends keyof FormState, K extends keyof FormState[S]>(
    section: S,
    key: K,
    value: FormState[S][K],
  ) => {
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  useEffect(() => {
    if (!mailingSameAsPhysical) {
      return;
    }
    setForm((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        mailingAddress: prev.address.physicalAddress,
        mailingApartment: prev.address.apartment,
        mailingCity: prev.address.city,
        mailingState: prev.address.state,
        mailingZipCode: prev.address.zipCode,
      },
    }));
  }, [
    mailingSameAsPhysical,
    form.address.physicalAddress,
    form.address.apartment,
    form.address.city,
    form.address.state,
    form.address.zipCode,
  ]);

  const validateForm = (): string[] => {
    const nextErrors: string[] = [];
    if (!form.vehicle.licensePlate.trim()) {
      nextErrors.push('License plate is required.');
    }
    if (!form.vehicle.vin.trim()) {
      nextErrors.push('VIN is required.');
    }
    if (!form.owner.trueFullName.trim()) {
      nextErrors.push('Owner full name is required.');
    }
    if (!form.owner.dlNumber.trim()) {
      nextErrors.push('Driver license/ID number is required.');
    }
    if (!form.address.physicalAddress.trim()) {
      nextErrors.push('Physical address is required.');
    }
    if (!form.address.city.trim() || !form.address.state.trim() || !form.address.zipCode.trim()) {
      nextErrors.push('City, state, and ZIP are required.');
    }
    if (form.address.zipCode.trim() && !/^\d{5}$/.test(form.address.zipCode)) {
      nextErrors.push('ZIP must be exactly 5 digits.');
    }
    if (form.address.state.trim() && !/^[A-Z]{2}$/.test(form.address.state)) {
      nextErrors.push('State must be exactly 2 letters.');
    }
    if (form.address.mailingState.trim() && !/^[A-Z]{2}$/.test(form.address.mailingState)) {
      nextErrors.push('Mailing state must be exactly 2 letters.');
    }
    if (form.address.mailingZipCode.trim() && !/^\d{5}$/.test(form.address.mailingZipCode)) {
      nextErrors.push('Mailing ZIP must be exactly 5 digits.');
    }
    if (!form.certification.signature.trim()) {
      nextErrors.push('Certification signature is required.');
    }
    if (!Object.values(form.requestedItems).some(Boolean)) {
      nextErrors.push('Select at least one requested replacement item.');
    }
    if (!Object.values(form.reason).some(Boolean)) {
      nextErrors.push('Select at least one replacement reason.');
    }
    if (!form.contact.email.trim()) {
      nextErrors.push('Email is required.');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact.email)) {
      nextErrors.push('Email format is invalid.');
    }
    if (!form.contact.phoneNumber.trim()) {
      nextErrors.push('Phone number is required.');
    }
    const combinedPhoneDigits = toPhoneDigits(
      `${form.contact.areaCode}${form.contact.phoneNumber}`,
    );
    if (combinedPhoneDigits.length > 0 && combinedPhoneDigits.length !== 10) {
      nextErrors.push('Phone number must be exactly 10 digits.');
    }
    if (form.owner.birthDate.trim() && !isUsDate(form.owner.birthDate)) {
      nextErrors.push('Birth date must be in MM/DD/YYYY format.');
    }
    if (form.certification.date.trim() && !isUsDate(form.certification.date)) {
      nextErrors.push('Certification date must be in MM/DD/YYYY format.');
    }
    return nextErrors;
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');

    const nextErrors = validateForm();
    setErrors(nextErrors);
    if (nextErrors.length) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${apiBaseUrl}/reg-156/pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const pdfBlob = await response.blob();
      const url = URL.createObjectURL(pdfBlob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'reg-156-filled.pdf';
      anchor.click();
      URL.revokeObjectURL(url);
      setMessage('PDF generated and download started.');
    } catch (error) {
      setErrors([
        `Failed to generate PDF. ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      ]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page-shell py-4">
      <div className="container-lg">
        <div className="card shadow-sm border-0">
          <div className="card-body p-4 p-md-5">
            <div className="mb-4">
              <h1 className="h3 mb-1">California DMV REG-156 Filler</h1>
              <p className="text-secondary mb-0">
                Complete the form below to generate a filled PDF.
              </p>
            </div>

            {errors.length > 0 && (
              <div className="alert alert-danger" role="alert">
                <ul className="mb-0 ps-3">
                  {errors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
            {message && (
              <div className="alert alert-success" role="alert">
                {message}
              </div>
            )}

            <form onSubmit={submit} className="d-grid gap-4">
              <section>
                <h2 className="section-title">Vehicle Information</h2>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label">License Plate *</label>
                    <input
                      className={`form-control ${
                        requiredInvalid(form.vehicle.licensePlate) ? 'is-invalid' : ''
                      }`}
                      value={form.vehicle.licensePlate}
                      onChange={(event) =>
                        setField('vehicle', 'licensePlate', event.target.value)
                      }
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Make</label>
                    <input
                      className="form-control"
                      value={form.vehicle.make}
                      onChange={(event) => setField('vehicle', 'make', event.target.value)}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">VIN *</label>
                    <input
                      className={`form-control ${
                        requiredInvalid(form.vehicle.vin) ? 'is-invalid' : ''
                      }`}
                      value={form.vehicle.vin}
                      onChange={(event) => setField('vehicle', 'vin', event.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">DP Number</label>
                    <input
                      className="form-control"
                      value={form.vehicle.dpNumber}
                      onChange={(event) => setField('vehicle', 'dpNumber', event.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Engine Number</label>
                    <input
                      className="form-control"
                      value={form.vehicle.engineNumber}
                      onChange={(event) =>
                        setField('vehicle', 'engineNumber', event.target.value)
                      }
                    />
                  </div>
                </div>
              </section>

              <section>
                <h2 className="section-title">Owner Information</h2>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">True Full Name *</label>
                    <input
                      className={`form-control ${
                        requiredInvalid(form.owner.trueFullName) ? 'is-invalid' : ''
                      }`}
                      value={form.owner.trueFullName}
                      onChange={(event) =>
                        setField('owner', 'trueFullName', event.target.value)
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">DL/ID Number *</label>
                    <input
                      className={`form-control ${
                        requiredInvalid(form.owner.dlNumber) ? 'is-invalid' : ''
                      }`}
                      value={form.owner.dlNumber}
                      onChange={(event) => setField('owner', 'dlNumber', event.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Co-owner Name</label>
                    <input
                      className="form-control"
                      value={form.owner.coOwnerName}
                      onChange={(event) =>
                        setField('owner', 'coOwnerName', event.target.value)
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Co-owner DL/ID Number</label>
                    <input
                      className="form-control"
                      value={form.owner.coOwnerDlNumber}
                      onChange={(event) =>
                        setField('owner', 'coOwnerDlNumber', event.target.value)
                      }
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Birth Date</label>
                    <input
                      className={`form-control ${
                        form.owner.birthDate.trim() && !isUsDate(form.owner.birthDate)
                          ? 'is-invalid'
                          : ''
                      }`}
                      value={form.owner.birthDate}
                      onChange={(event) =>
                        setField('owner', 'birthDate', formatDateInput(event.target.value))
                      }
                      placeholder="MM/DD/YYYY"
                      inputMode="numeric"
                      maxLength={10}
                    />
                  </div>
                </div>
              </section>

              <section>
                <h2 className="section-title">Address and Contact</h2>
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label">Physical Address *</label>
                    <input
                      className={`form-control ${
                        requiredInvalid(form.address.physicalAddress) ? 'is-invalid' : ''
                      }`}
                      value={form.address.physicalAddress}
                      onChange={(event) =>
                        setField('address', 'physicalAddress', event.target.value)
                      }
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Apt</label>
                    <input
                      className="form-control"
                      value={form.address.apartment}
                      onChange={(event) => setField('address', 'apartment', event.target.value)}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">City *</label>
                    <input
                      className={`form-control ${
                        requiredInvalid(form.address.city) ? 'is-invalid' : ''
                      }`}
                      value={form.address.city}
                      onChange={(event) => setField('address', 'city', event.target.value)}
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">State *</label>
                    <input
                      className={`form-control ${
                        requiredInvalid(form.address.state) || form.address.state.length !== 2
                          ? 'is-invalid'
                          : ''
                      }`}
                      value={form.address.state}
                      onChange={(event) =>
                        setField('address', 'state', sanitizeStateInput(event.target.value))
                      }
                      maxLength={2}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">ZIP *</label>
                    <input
                      className={`form-control ${
                        requiredInvalid(form.address.zipCode) ||
                        !/^\d{5}$/.test(form.address.zipCode)
                          ? 'is-invalid'
                          : ''
                      }`}
                      value={form.address.zipCode}
                      onChange={(event) =>
                        setField('address', 'zipCode', sanitizeZipInput(event.target.value))
                      }
                      inputMode="numeric"
                      maxLength={5}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">County</label>
                    <input
                      className="form-control"
                      value={form.address.county}
                      onChange={(event) => setField('address', 'county', event.target.value)}
                    />
                  </div>
                  <div className="col-12">
                    <div className="address-splitter form-check mt-1 mb-1 pt-2 pb-2">
                      <input
                        id="mailing-same-as-physical"
                        className="form-check-input"
                        type="checkbox"
                        checked={mailingSameAsPhysical}
                        onChange={(event) => setMailingSameAsPhysical(event.target.checked)}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="mailing-same-as-physical"
                      >
                        Mailing address is the same as physical address
                      </label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Mailing Address</label>
                    <input
                      className="form-control"
                      value={form.address.mailingAddress}
                      onChange={(event) =>
                        setField('address', 'mailingAddress', event.target.value)
                      }
                      disabled={mailingSameAsPhysical}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Mailing Apt</label>
                    <input
                      className="form-control"
                      value={form.address.mailingApartment}
                      onChange={(event) =>
                        setField('address', 'mailingApartment', event.target.value)
                      }
                      disabled={mailingSameAsPhysical}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Mailing City</label>
                    <input
                      className="form-control"
                      value={form.address.mailingCity}
                      onChange={(event) =>
                        setField('address', 'mailingCity', event.target.value)
                      }
                      disabled={mailingSameAsPhysical}
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Mailing State</label>
                    <input
                      className="form-control"
                      value={form.address.mailingState}
                      onChange={(event) =>
                        setField(
                          'address',
                          'mailingState',
                          sanitizeStateInput(event.target.value),
                        )
                      }
                      maxLength={2}
                      disabled={mailingSameAsPhysical}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Mailing ZIP</label>
                    <input
                      className={`form-control ${
                        form.address.mailingZipCode.trim() &&
                        !/^\d{5}$/.test(form.address.mailingZipCode)
                          ? 'is-invalid'
                          : ''
                      }`}
                      value={form.address.mailingZipCode}
                      onChange={(event) =>
                        setField(
                          'address',
                          'mailingZipCode',
                          sanitizeZipInput(event.target.value),
                        )
                      }
                      inputMode="numeric"
                      maxLength={5}
                      disabled={mailingSameAsPhysical}
                    />
                  </div>
                </div>
              </section>

              <section>
                <h2 className="section-title">Requested Replacement Items</h2>
                <div className="row g-2">
                  {Object.entries(form.requestedItems).map(([key, value]) => (
                    <div className="col-md-6" key={key}>
                      <div className="form-check">
                        <input
                          id={`requested-${key}`}
                          className="form-check-input"
                          type="checkbox"
                          checked={value}
                          onChange={(event) =>
                            setField(
                              'requestedItems',
                              key as keyof FormState['requestedItems'],
                              event.target.checked,
                            )
                          }
                        />
                        <label className="form-check-label" htmlFor={`requested-${key}`}>
                          {requestedItemLabels[key as keyof FormState['requestedItems']]}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="section-title">Reason for Replacement</h2>
                <div className="row g-2">
                  {Object.entries(form.reason).map(([key, value]) => (
                    <div className="col-md-6" key={key}>
                      <div className="form-check">
                        <input
                          id={`reason-${key}`}
                          className="form-check-input"
                          type="checkbox"
                          checked={value}
                          onChange={(event) =>
                            setField(
                              'reason',
                              key as keyof FormState['reason'],
                              event.target.checked,
                            )
                          }
                        />
                        <label className="form-check-label" htmlFor={`reason-${key}`}>
                          {reasonLabels[key as keyof FormState['reason']]}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="section-title">Plate Count and Additional Request</h2>
                <div className="row g-2 mb-3">
                  {Object.entries(form.replacementCount).map(([key, value]) => (
                    <div className="col-md-6" key={key}>
                      <div className="form-check">
                        <input
                          id={`count-${key}`}
                          className="form-check-input"
                          type="checkbox"
                          checked={value}
                          onChange={(event) =>
                            setField(
                              'replacementCount',
                              key as keyof FormState['replacementCount'],
                              event.target.checked,
                            )
                          }
                        />
                        <label className="form-check-label" htmlFor={`count-${key}`}>
                          {replacementCountLabels[key as keyof FormState['replacementCount']]}
                        </label>
                      </div>
                    </div>
                  ))}
                  {Object.entries(form.additionalRequest)
                    .filter(([key]) => key !== 'explanation')
                    .map(([key, value]) => (
                      <div className="col-md-6" key={key}>
                        <div className="form-check">
                          <input
                            id={`extra-${key}`}
                            className="form-check-input"
                            type="checkbox"
                            checked={Boolean(value)}
                            onChange={(event) =>
                              setField(
                                'additionalRequest',
                                key as keyof FormState['additionalRequest'],
                                event.target.checked,
                              )
                            }
                          />
                          <label className="form-check-label" htmlFor={`extra-${key}`}>
                            {
                              additionalRequestLabels[
                                key as Exclude<
                                  keyof FormState['additionalRequest'],
                                  'explanation'
                                >
                              ]
                            }
                          </label>
                        </div>
                      </div>
                    ))}
                </div>
                <label className="form-label">Explanation</label>
                <textarea
                  className="form-control"
                  value={form.additionalRequest.explanation}
                  onChange={(event) =>
                    setField('additionalRequest', 'explanation', event.target.value)
                  }
                  rows={3}
                />
              </section>

              <section>
                <h2 className="section-title">Certification</h2>
                <div className="row g-3">
                  <div className="col-md-5">
                    <label className="form-label">Signature *</label>
                    <input
                      className={`form-control ${
                        requiredInvalid(form.certification.signature) ? 'is-invalid' : ''
                      }`}
                      value={form.certification.signature}
                      onChange={(event) =>
                        setField('certification', 'signature', event.target.value)
                      }
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Title</label>
                    <input
                      className="form-control"
                      value={form.certification.title}
                      onChange={(event) => setField('certification', 'title', event.target.value)}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Date</label>
                    <input
                      className={`form-control ${
                        form.certification.date.trim() &&
                        !isUsDate(form.certification.date)
                          ? 'is-invalid'
                          : ''
                      }`}
                      value={form.certification.date}
                      onChange={(event) =>
                        setField(
                          'certification',
                          'date',
                          formatDateInput(event.target.value),
                        )
                      }
                      placeholder="MM/DD/YYYY"
                      inputMode="numeric"
                      maxLength={10}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      className={`form-control ${
                        requiredInvalid(form.contact.email) ||
                        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact.email)
                          ? 'is-invalid'
                          : ''
                      }`}
                      value={form.contact.email}
                      onChange={(event) =>
                        setField('contact', 'email', sanitizeEmailInput(event.target.value))
                      }
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Phone Number *</label>
                    <input
                      aria-label="Phone number"
                      className={`form-control ${
                        toPhoneDigits(`${form.contact.areaCode}${form.contact.phoneNumber}`)
                          .length !== 10
                          ? 'is-invalid'
                          : ''
                      }`}
                      value={formatPhoneDisplay(
                        toPhoneDigits(`${form.contact.areaCode}${form.contact.phoneNumber}`),
                      )}
                      onChange={(event) => {
                        const { areaCode, phoneNumber } = splitPhoneFromCombined(
                          event.target.value,
                        );
                        setForm((prev) => ({
                          ...prev,
                          contact: {
                            ...prev.contact,
                            areaCode,
                            phoneNumber,
                          },
                        }));
                      }}
                      required
                      inputMode="numeric"
                      maxLength={14}
                      placeholder="(000) 000-0000"
                    />
                  </div>
                </div>
              </section>

              <div className="d-flex gap-2 pt-2">
                <button type="submit" className="btn btn-primary px-4" disabled={submitting}>
                  {submitting ? 'Generating PDF...' : 'Generate Filled PDF'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;
