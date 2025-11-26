export interface PublicKeyCredentialRpEntityJSON {
  id?: string;
  name: string;
}

export interface PublicKeyCredentialUserEntityJSON {
  id: string;
  name: string;
  displayName: string;
}

export interface PublicKeyCredentialDescriptorJSON {
  id: string;
  type: 'public-key';
  transports?: AuthenticatorTransport[];
}

export interface PublicKeyCredentialCreationOptionsJSON {
  challenge: string;
  rp: PublicKeyCredentialRpEntityJSON;
  user: PublicKeyCredentialUserEntityJSON;
  pubKeyCredParams: Array<{ type: 'public-key'; alg: number }>;
  timeout?: number;
  attestation?: AttestationConveyancePreference;
  authenticatorSelection?: {
    authenticatorAttachment?: AuthenticatorAttachment;
    residentKey?: ResidentKeyRequirement;
    userVerification?: UserVerificationRequirement;
    requireResidentKey?: boolean;
  };
  excludeCredentials?: PublicKeyCredentialDescriptorJSON[];
}

export interface PublicKeyCredentialRequestOptionsJSON {
  challenge: string;
  rpId?: string;
  allowCredentials?: PublicKeyCredentialDescriptorJSON[];
  userVerification?: UserVerificationRequirement;
  timeout?: number;
}

export interface RegistrationResponseJSON {
  id: string;
  rawId: string;
  response: {
    clientDataJSON: string;
    attestationObject: string;
    transports?: AuthenticatorTransport[];
  };
  clientExtensionResults?: Record<string, unknown>;
  type: PublicKeyCredential['type'];
  authenticatorAttachment?: AuthenticatorAttachment | null;
}

export interface AuthenticationResponseJSON {
  id: string;
  rawId: string;
  response: {
    authenticatorData: string;
    clientDataJSON: string;
    signature: string;
    userHandle?: string | null;
  };
  clientExtensionResults?: Record<string, unknown>;
  type: PublicKeyCredential['type'];
  authenticatorAttachment?: AuthenticatorAttachment | null;
}

export interface BiometricLoginOptionsResponse {
  options: PublicKeyCredentialRequestOptionsJSON;
  displayName?: string;
  phone: string;
}

export interface BiometricMeta {
  phone: string;
  displayName?: string;
  credentialId?: string;
}
