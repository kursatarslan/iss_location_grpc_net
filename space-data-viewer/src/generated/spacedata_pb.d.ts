import * as jspb from 'google-protobuf'



export class SpaceDataRequest extends jspb.Message {
  getDatatype(): string;
  setDatatype(value: string): SpaceDataRequest;

  getConnectionid(): string;
  setConnectionid(value: string): SpaceDataRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SpaceDataRequest.AsObject;
  static toObject(includeInstance: boolean, msg: SpaceDataRequest): SpaceDataRequest.AsObject;
  static serializeBinaryToWriter(message: SpaceDataRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SpaceDataRequest;
  static deserializeBinaryFromReader(message: SpaceDataRequest, reader: jspb.BinaryReader): SpaceDataRequest;
}

export namespace SpaceDataRequest {
  export type AsObject = {
    datatype: string,
    connectionid: string,
  }
}

export class SpaceDataResponse extends jspb.Message {
  getValue(): number;
  setValue(value: number): SpaceDataResponse;

  getMeasurementtime(): string;
  setMeasurementtime(value: string): SpaceDataResponse;

  getDatatype(): string;
  setDatatype(value: string): SpaceDataResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SpaceDataResponse.AsObject;
  static toObject(includeInstance: boolean, msg: SpaceDataResponse): SpaceDataResponse.AsObject;
  static serializeBinaryToWriter(message: SpaceDataResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SpaceDataResponse;
  static deserializeBinaryFromReader(message: SpaceDataResponse, reader: jspb.BinaryReader): SpaceDataResponse;
}

export namespace SpaceDataResponse {
  export type AsObject = {
    value: number,
    measurementtime: string,
    datatype: string,
  }
}

