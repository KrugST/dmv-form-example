import json
import sys
from typing import Any, Dict

from pypdf import PdfReader, PdfWriter
from pypdf.generic import NameObject


def _as_yes_no(value: bool) -> str:
    return "/Yes" if value else "/Off"


def _get_bool(data: Dict[str, Any], *path: str) -> bool:
    current: Any = data
    for key in path:
        if not isinstance(current, dict):
            return False
        current = current.get(key)
    return bool(current)


def _get_str(data: Dict[str, Any], *path: str) -> str:
    current: Any = data
    for key in path:
        if not isinstance(current, dict):
            return ""
        current = current.get(key)
    if current is None:
        return ""
    return str(current)


def _build_field_values(payload: Dict[str, Any]) -> Dict[str, str]:
    explanation = _get_str(payload, "additionalRequest", "explanation")

    return {
        "Vehicle license plate": _get_str(payload, "vehicle", "licensePlate"),
        "Make": _get_str(payload, "vehicle", "make"),
        "VIN": _get_str(payload, "vehicle", "vin"),
        "DP number": _get_str(payload, "vehicle", "dpNumber"),
        "Birth date": _get_str(payload, "owner", "birthDate"),
        "Engine number": _get_str(payload, "vehicle", "engineNumber"),
        "True full name": _get_str(payload, "owner", "trueFullName"),
        "DL1": _get_str(payload, "owner", "dlNumber"),
        "Co owner": _get_str(payload, "owner", "coOwnerName"),
        "2DL1": _get_str(payload, "owner", "coOwnerDlNumber"),
        "Physical address": _get_str(payload, "address", "physicalAddress"),
        "Apt #": _get_str(payload, "address", "apartment"),
        "City": _get_str(payload, "address", "city"),
        "state": _get_str(payload, "address", "state"),
        "zip code": _get_str(payload, "address", "zipCode"),
        "County": _get_str(payload, "address", "county"),
        "Mailing address": _get_str(payload, "address", "mailingAddress"),
        "Apt 2": _get_str(payload, "address", "mailingApartment"),
        "City2": _get_str(payload, "address", "mailingCity"),
        "state2": _get_str(payload, "address", "mailingState"),
        "zip code2": _get_str(payload, "address", "mailingZipCode"),
        "Explanation": explanation,
        "certification": _get_str(payload, "certification", "signature"),
        "title": _get_str(payload, "certification", "title"),
        "0": _get_str(payload, "certification", "date"),
        "1": _get_str(payload, "contact", "email"),
        "area code": _get_str(payload, "contact", "areaCode"),
        "telephone number": _get_str(payload, "contact", "phoneNumber"),
        "date.0": _get_str(payload, "certification", "date"),
        "date.1": _get_str(payload, "certification", "date"),
        "License plates": _as_yes_no(
            _get_bool(payload, "requestedItems", "licensePlates")
        ),
        "Reg Card": _as_yes_no(_get_bool(payload, "requestedItems", "regCard")),
        "license year": _as_yes_no(
            _get_bool(payload, "requestedItems", "licenseYearSticker")
        ),
        "license month": _as_yes_no(
            _get_bool(payload, "requestedItems", "licenseMonthSticker")
        ),
        "vessel year": _as_yes_no(
            _get_bool(payload, "requestedItems", "vesselYearSticker")
        ),
        "vessel cert": _as_yes_no(
            _get_bool(payload, "requestedItems", "vesselCert")
        ),
        "mussel": _as_yes_no(_get_bool(payload, "requestedItems", "musselFeeSticker")),
        "DP Placard": _as_yes_no(_get_bool(payload, "requestedItems", "dpPlacard")),
        "DP ID card": _as_yes_no(_get_bool(payload, "requestedItems", "dpIdCard")),
        "PNO": _as_yes_no(_get_bool(payload, "requestedItems", "pnoCard")),
        "PFR": _as_yes_no(_get_bool(payload, "requestedItems", "pfrSticker")),
        "CVRA weight": _as_yes_no(
            _get_bool(payload, "requestedItems", "cvraWeightDecal")
        ),
        "CVRA year": _as_yes_no(_get_bool(payload, "requestedItems", "cvraYearSticker")),
        "Trailer/OHV ID": _as_yes_no(
            _get_bool(payload, "requestedItems", "trailerOhvId")
        ),
        "Lost": _as_yes_no(_get_bool(payload, "reason", "lost")),
        "Stolen": _as_yes_no(_get_bool(payload, "reason", "stolen")),
        "destroyed": _as_yes_no(_get_bool(payload, "reason", "destroyed")),
        "Not Received DMV": _as_yes_no(_get_bool(payload, "reason", "notReceivedFromDmv")),
        "Not received prior owner": _as_yes_no(
            _get_bool(payload, "reason", "notReceivedFromPriorOwner")
        ),
        "Surrendered": _as_yes_no(_get_bool(payload, "reason", "surrendered")),
        "one": _as_yes_no(_get_bool(payload, "replacementCount", "onePlate")),
        "Two": _as_yes_no(_get_bool(payload, "replacementCount", "twoPlates")),
        "Special plates": _as_yes_no(
            _get_bool(payload, "additionalRequest", "specialPlates")
        ),
        "REG card with current address": _as_yes_no(
            _get_bool(payload, "additionalRequest", "regCardWithCurrentAddress")
        ),
        "CVC": _as_yes_no(_get_bool(payload, "additionalRequest", "cvc5202Compliance")),
        "other": _as_yes_no(_get_bool(payload, "additionalRequest", "other")),
        "One license": _as_yes_no(_get_bool(payload, "replacementCount", "oneLicensePlate")),
        "Two plates": _as_yes_no(
            _get_bool(payload, "replacementCount", "twoLicensePlates")
        ),
    }


def main() -> None:
    if len(sys.argv) < 2:
        raise ValueError("Template path argument is required")

    template_path = sys.argv[1]
    payload = json.loads(sys.stdin.read())

    reader = PdfReader(template_path)
    if reader.is_encrypted:
        reader.decrypt("")

    writer = PdfWriter()
    writer.append_pages_from_reader(reader)
    writer._root_object.update(  # pylint: disable=protected-access
        {NameObject("/AcroForm"): reader.trailer["/Root"]["/AcroForm"].get_object()}
    )
    writer.set_need_appearances_writer(True)

    field_values = _build_field_values(payload)
    for page in writer.pages:
        writer.update_page_form_field_values(
            page, field_values, auto_regenerate=False, flatten=False
        )

    writer.write(sys.stdout.buffer)


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:  # noqa: BLE001
        print(str(exc), file=sys.stderr)
        sys.exit(1)
