import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

class VehicleInfoDto {
  @IsString()
  @MaxLength(10)
  licensePlate!: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  make?: string;

  @IsString()
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
  @MaxLength(80)
  trueFullName!: string;

  @IsString()
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
  @IsString()
  @MaxLength(30)
  birthDate?: string;
}

class AddressInfoDto {
  @IsString()
  @MaxLength(80)
  physicalAddress!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  apartment?: string;

  @IsString()
  @MaxLength(50)
  city!: string;

  @IsString()
  @MaxLength(2)
  state!: string;

  @IsString()
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
  @MaxLength(2)
  mailingState?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  mailingZipCode?: string;
}

class ContactInfoDto {
  @IsOptional()
  @IsEmail()
  @MaxLength(120)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5)
  areaCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(15)
  phoneNumber?: string;
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
  @IsString()
  @MaxLength(80)
  signature!: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  title?: string;

  @IsOptional()
  @IsString()
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
  requestedItems!: RequestedItemsDto;

  @ValidateNested()
  @Type(() => ReasonDto)
  reason!: ReasonDto;

  @ValidateNested()
  @Type(() => ReplacementCountDto)
  replacementCount!: ReplacementCountDto;

  @ValidateNested()
  @Type(() => AdditionalRequestDto)
  additionalRequest!: AdditionalRequestDto;

  @ValidateNested()
  @Type(() => CertificationDto)
  certification!: CertificationDto;
}
