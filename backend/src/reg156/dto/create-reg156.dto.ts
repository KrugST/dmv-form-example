import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  Matches,
  IsString,
  MaxLength,
  Validate,
  ValidationArguments,
  ValidateNested,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'atLeastOneTrue', async: false })
class AtLeastOneTrueConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (!value || typeof value !== 'object') {
      return false;
    }
    return Object.values(value as Record<string, unknown>).some(
      (fieldValue) => fieldValue === true,
    );
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must have at least one selected option`;
  }
}

@ValidatorConstraint({ name: 'signaturePresent', async: false })
class SignaturePresentConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (!value || typeof value !== 'object') {
      return false;
    }
    const certification = value as Record<string, unknown>;
    const signature = certification.signature;
    const signatureImage = certification.signatureImage;
    const hasTypedSignature =
      typeof signature === 'string' && signature.trim().length > 0;
    const hasDrawnSignature =
      typeof signatureImage === 'string' && signatureImage.trim().length > 0;
    return hasTypedSignature || hasDrawnSignature;
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must include a drawn or typed signature`;
  }
}

class VehicleInfoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  licensePlate!: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  make?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  vin!: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  dpNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  engineNumber?: string;
}

class OwnerInfoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  trueFullName!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  dlNumber!: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  coOwnerName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  coOwnerDlNumber?: string;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' && value.trim() === '' ? undefined : value,
  )
  @IsString()
  @Matches(/^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/, {
    message: 'birthDate must be in MM/DD/YYYY format',
  })
  @MaxLength(30)
  birthDate?: string;
}

class AddressInfoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  physicalAddress!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  apartment?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  city!: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase().trim() : value,
  )
  @Matches(/^[A-Z]{2}$/, { message: 'state must be exactly 2 letters' })
  @MaxLength(2)
  state!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{5}$/, { message: 'zipCode must be exactly 5 digits' })
  @MaxLength(10)
  zipCode!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  county?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  mailingAddress?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  mailingApartment?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  mailingCity?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim() === ''
        ? undefined
        : value.toUpperCase().trim()
      : value,
  )
  @Matches(/^[A-Z]{2}$/, {
    message: 'mailingState must be exactly 2 letters',
  })
  @MaxLength(2)
  mailingState?: string;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' && value.trim() === '' ? undefined : value,
  )
  @IsString()
  @Matches(/^\d{5}$/, {
    message: 'mailingZipCode must be exactly 5 digits',
  })
  @MaxLength(10)
  mailingZipCode?: string;
}

class ContactInfoDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(120)
  email!: string;

  @Transform(({ value }) =>
    typeof value === 'string' && value.trim() === '' ? undefined : value,
  )
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{3}$/, { message: 'areaCode must be exactly 3 digits' })
  @MaxLength(5)
  areaCode!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{3}-\d{4}$/, {
    message: 'phoneNumber must be in 123-4567 format',
  })
  @MaxLength(15)
  phoneNumber!: string;
}

class RequestedItemsDto {
  @IsOptional()
  @IsBoolean()
  licensePlates?: boolean;

  @IsOptional()
  @IsBoolean()
  regCard?: boolean;

  @IsOptional()
  @IsBoolean()
  licenseYearSticker?: boolean;

  @IsOptional()
  @IsBoolean()
  licenseMonthSticker?: boolean;

  @IsOptional()
  @IsBoolean()
  vesselYearSticker?: boolean;

  @IsOptional()
  @IsBoolean()
  vesselCert?: boolean;

  @IsOptional()
  @IsBoolean()
  musselFeeSticker?: boolean;

  @IsOptional()
  @IsBoolean()
  dpPlacard?: boolean;

  @IsOptional()
  @IsBoolean()
  dpIdCard?: boolean;

  @IsOptional()
  @IsBoolean()
  pnoCard?: boolean;

  @IsOptional()
  @IsBoolean()
  pfrSticker?: boolean;

  @IsOptional()
  @IsBoolean()
  cvraWeightDecal?: boolean;

  @IsOptional()
  @IsBoolean()
  cvraYearSticker?: boolean;

  @IsOptional()
  @IsBoolean()
  trailerOhvId?: boolean;
}

class ReasonDto {
  @IsOptional()
  @IsBoolean()
  lost?: boolean;

  @IsOptional()
  @IsBoolean()
  stolen?: boolean;

  @IsOptional()
  @IsBoolean()
  destroyed?: boolean;

  @IsOptional()
  @IsBoolean()
  notReceivedFromDmv?: boolean;

  @IsOptional()
  @IsBoolean()
  notReceivedFromPriorOwner?: boolean;

  @IsOptional()
  @IsBoolean()
  surrendered?: boolean;
}

class ReplacementCountDto {
  @IsOptional()
  @IsBoolean()
  onePlate?: boolean;

  @IsOptional()
  @IsBoolean()
  twoPlates?: boolean;

  @IsOptional()
  @IsBoolean()
  oneLicensePlate?: boolean;

  @IsOptional()
  @IsBoolean()
  twoLicensePlates?: boolean;
}

class AdditionalRequestDto {
  @IsOptional()
  @IsBoolean()
  specialPlates?: boolean;

  @IsOptional()
  @IsBoolean()
  regCardWithCurrentAddress?: boolean;

  @IsOptional()
  @IsBoolean()
  cvc5202Compliance?: boolean;

  @IsOptional()
  @IsBoolean()
  other?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  explanation?: string;
}

class CertificationDto {
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' && value.trim() === '' ? undefined : value,
  )
  @IsString()
  @MaxLength(80)
  signature?: string;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' && value.trim() === '' ? undefined : value,
  )
  @IsString()
  @MaxLength(2_000_000)
  signatureImage?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  title?: string;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' && value.trim() === '' ? undefined : value,
  )
  @IsString()
  @Matches(/^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/, {
    message: 'date must be in MM/DD/YYYY format',
  })
  @MaxLength(20)
  date?: string;
}

export class CreateReg156Dto {
  @ValidateNested()
  @Type(() => VehicleInfoDto)
  vehicle!: VehicleInfoDto;

  @ValidateNested()
  @Type(() => OwnerInfoDto)
  owner!: OwnerInfoDto;

  @ValidateNested()
  @Type(() => AddressInfoDto)
  address!: AddressInfoDto;

  @ValidateNested()
  @Type(() => ContactInfoDto)
  contact!: ContactInfoDto;

  @ValidateNested()
  @Type(() => RequestedItemsDto)
  @Validate(AtLeastOneTrueConstraint, {
    message:
      'requestedItems must include at least one selected replacement item',
  })
  requestedItems!: RequestedItemsDto;

  @ValidateNested()
  @Type(() => ReasonDto)
  @Validate(AtLeastOneTrueConstraint, {
    message: 'reason must include at least one selected replacement reason',
  })
  reason!: ReasonDto;

  @ValidateNested()
  @Type(() => ReplacementCountDto)
  replacementCount!: ReplacementCountDto;

  @ValidateNested()
  @Type(() => AdditionalRequestDto)
  additionalRequest!: AdditionalRequestDto;

  @ValidateNested()
  @Type(() => CertificationDto)
  @Validate(SignaturePresentConstraint)
  certification!: CertificationDto;
}
