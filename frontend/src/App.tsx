import { useMemo, useState } from 'react';
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

function App() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const apiBaseUrl = useMemo(
    () => import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000',
    [],
  );

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
    if (!form.certification.signature.trim()) {
      nextErrors.push('Certification signature is required.');
    }
    if (!Object.values(form.requestedItems).some(Boolean)) {
      nextErrors.push('Select at least one requested replacement item.');
    }
    if (!Object.values(form.reason).some(Boolean)) {
      nextErrors.push('Select at least one replacement reason.');
    }
    if (form.contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact.email)) {
      nextErrors.push('Email format is invalid.');
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
    <main className="container">
      <h1>California DMV REG-156 Filler</h1>
      <p className="subtitle">
        Complete this form and submit to generate a filled PDF.
      </p>

      {errors.length > 0 && (
        <div className="alert error">
          {errors.map((error) => (
            <div key={error}>{error}</div>
          ))}
        </div>
      )}
      {message && <div className="alert success">{message}</div>}

      <form onSubmit={submit}>
        <fieldset>
          <legend>Vehicle Information</legend>
          <div className="grid">
            <label>
              License Plate *
              <input
                value={form.vehicle.licensePlate}
                onChange={(event) =>
                  setField('vehicle', 'licensePlate', event.target.value)
                }
              />
            </label>
            <label>
              Make
              <input
                value={form.vehicle.make}
                onChange={(event) => setField('vehicle', 'make', event.target.value)}
              />
            </label>
            <label>
              VIN *
              <input
                value={form.vehicle.vin}
                onChange={(event) => setField('vehicle', 'vin', event.target.value)}
              />
            </label>
            <label>
              DP Number
              <input
                value={form.vehicle.dpNumber}
                onChange={(event) => setField('vehicle', 'dpNumber', event.target.value)}
              />
            </label>
            <label>
              Engine Number
              <input
                value={form.vehicle.engineNumber}
                onChange={(event) =>
                  setField('vehicle', 'engineNumber', event.target.value)
                }
              />
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>Owner Information</legend>
          <div className="grid">
            <label>
              True Full Name *
              <input
                value={form.owner.trueFullName}
                onChange={(event) =>
                  setField('owner', 'trueFullName', event.target.value)
                }
              />
            </label>
            <label>
              DL/ID Number *
              <input
                value={form.owner.dlNumber}
                onChange={(event) => setField('owner', 'dlNumber', event.target.value)}
              />
            </label>
            <label>
              Co-owner Name
              <input
                value={form.owner.coOwnerName}
                onChange={(event) =>
                  setField('owner', 'coOwnerName', event.target.value)
                }
              />
            </label>
            <label>
              Co-owner DL/ID Number
              <input
                value={form.owner.coOwnerDlNumber}
                onChange={(event) =>
                  setField('owner', 'coOwnerDlNumber', event.target.value)
                }
              />
            </label>
            <label>
              Birth Date
              <input
                value={form.owner.birthDate}
                onChange={(event) => setField('owner', 'birthDate', event.target.value)}
                placeholder="MM/DD/YYYY"
              />
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>Address and Contact</legend>
          <div className="grid">
            <label>
              Physical Address *
              <input
                value={form.address.physicalAddress}
                onChange={(event) =>
                  setField('address', 'physicalAddress', event.target.value)
                }
              />
            </label>
            <label>
              Apt
              <input
                value={form.address.apartment}
                onChange={(event) => setField('address', 'apartment', event.target.value)}
              />
            </label>
            <label>
              City *
              <input
                value={form.address.city}
                onChange={(event) => setField('address', 'city', event.target.value)}
              />
            </label>
            <label>
              State *
              <input
                value={form.address.state}
                onChange={(event) => setField('address', 'state', event.target.value)}
              />
            </label>
            <label>
              ZIP *
              <input
                value={form.address.zipCode}
                onChange={(event) => setField('address', 'zipCode', event.target.value)}
              />
            </label>
            <label>
              County
              <input
                value={form.address.county}
                onChange={(event) => setField('address', 'county', event.target.value)}
              />
            </label>
            <label>
              Mailing Address
              <input
                value={form.address.mailingAddress}
                onChange={(event) =>
                  setField('address', 'mailingAddress', event.target.value)
                }
              />
            </label>
            <label>
              Mailing Apt
              <input
                value={form.address.mailingApartment}
                onChange={(event) =>
                  setField('address', 'mailingApartment', event.target.value)
                }
              />
            </label>
            <label>
              Mailing City
              <input
                value={form.address.mailingCity}
                onChange={(event) =>
                  setField('address', 'mailingCity', event.target.value)
                }
              />
            </label>
            <label>
              Mailing State
              <input
                value={form.address.mailingState}
                onChange={(event) =>
                  setField('address', 'mailingState', event.target.value)
                }
              />
            </label>
            <label>
              Mailing ZIP
              <input
                value={form.address.mailingZipCode}
                onChange={(event) =>
                  setField('address', 'mailingZipCode', event.target.value)
                }
              />
            </label>
            <label>
              Email
              <input
                value={form.contact.email}
                onChange={(event) => setField('contact', 'email', event.target.value)}
                type="email"
              />
            </label>
            <label>
              Area Code
              <input
                value={form.contact.areaCode}
                onChange={(event) => setField('contact', 'areaCode', event.target.value)}
              />
            </label>
            <label>
              Telephone Number
              <input
                value={form.contact.phoneNumber}
                onChange={(event) =>
                  setField('contact', 'phoneNumber', event.target.value)
                }
              />
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>Requested Replacement Items</legend>
          <div className="checkbox-grid">
            {Object.entries(form.requestedItems).map(([key, value]) => (
              <label key={key} className="checkbox">
                <input
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
                {key}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>Reason for Replacement</legend>
          <div className="checkbox-grid">
            {Object.entries(form.reason).map(([key, value]) => (
              <label key={key} className="checkbox">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(event) =>
                    setField('reason', key as keyof FormState['reason'], event.target.checked)
                  }
                />
                {key}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>Plate Count and Additional Request</legend>
          <div className="checkbox-grid">
            {Object.entries(form.replacementCount).map(([key, value]) => (
              <label key={key} className="checkbox">
                <input
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
                {key}
              </label>
            ))}
            {Object.entries(form.additionalRequest)
              .filter(([key]) => key !== 'explanation')
              .map(([key, value]) => (
                <label key={key} className="checkbox">
                  <input
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
                  {key}
                </label>
              ))}
          </div>
          <label>
            Explanation
            <textarea
              value={form.additionalRequest.explanation}
              onChange={(event) =>
                setField('additionalRequest', 'explanation', event.target.value)
              }
            />
          </label>
        </fieldset>

        <fieldset>
          <legend>Certification</legend>
          <div className="grid">
            <label>
              Signature *
              <input
                value={form.certification.signature}
                onChange={(event) =>
                  setField('certification', 'signature', event.target.value)
                }
              />
            </label>
            <label>
              Title
              <input
                value={form.certification.title}
                onChange={(event) =>
                  setField('certification', 'title', event.target.value)
                }
              />
            </label>
            <label>
              Date
              <input
                value={form.certification.date}
                onChange={(event) => setField('certification', 'date', event.target.value)}
                placeholder="MM/DD/YYYY"
              />
            </label>
          </div>
        </fieldset>

        <button type="submit" disabled={submitting}>
          {submitting ? 'Generating PDF...' : 'Generate Filled PDF'}
        </button>
      </form>
    </main>
  );
}

export default App;
