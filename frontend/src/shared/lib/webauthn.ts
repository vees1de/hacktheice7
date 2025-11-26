import type {
  AuthenticationResponseJSON,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON
} from '@entities/auth/types/webauthn.types';

const bufferToBase64Url = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/u, '');
};

const base64UrlToBuffer = (value: string): ArrayBuffer => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const pad = normalized.length % 4;
  const padded = normalized + (pad ? '='.repeat(4 - pad) : '');
  const binary = atob(padded);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return buffer;
};

export const isPlatformAuthenticatorAvailable = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || !window.PublicKeyCredential) {
    return false;
  }

  try {
    const available =
      await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    return Boolean(available);
  } catch {
    return false;
  }
};

export const toCreationOptions = (
  options: PublicKeyCredentialCreationOptionsJSON
): PublicKeyCredentialCreationOptions => {
  return {
    ...options,
    challenge: base64UrlToBuffer(options.challenge),
    user: {
      ...options.user,
      id: base64UrlToBuffer(options.user.id)
    },
    excludeCredentials: options.excludeCredentials?.map(cred => ({
      ...cred,
      id: base64UrlToBuffer(cred.id)
    }))
  };
};

export const toRequestOptions = (
  options: PublicKeyCredentialRequestOptionsJSON
): PublicKeyCredentialRequestOptions => {
  return {
    ...options,
    challenge: base64UrlToBuffer(options.challenge),
    allowCredentials: options.allowCredentials?.map(cred => ({
      ...cred,
      id: base64UrlToBuffer(cred.id)
    }))
  };
};

export const attestationToJSON = (
  credential: PublicKeyCredential
): RegistrationResponseJSON => {
  const response = credential.response as AuthenticatorAttestationResponse;
  const transports =
    typeof (response as any).getTransports === 'function'
      ? (response as any).getTransports()
      : undefined;

  return {
    id: credential.id,
    rawId: bufferToBase64Url(credential.rawId),
    response: {
      clientDataJSON: bufferToBase64Url(response.clientDataJSON),
      attestationObject: bufferToBase64Url(response.attestationObject),
      transports
    },
    authenticatorAttachment: credential.authenticatorAttachment ?? null,
    clientExtensionResults: credential.getClientExtensionResults(),
    type: credential.type
  };
};

export const assertionToJSON = (
  credential: PublicKeyCredential
): AuthenticationResponseJSON => {
  const response = credential.response as AuthenticatorAssertionResponse;
  const userHandle =
    response.userHandle && response.userHandle.byteLength > 0
      ? bufferToBase64Url(response.userHandle)
      : undefined;

  return {
    id: credential.id,
    rawId: bufferToBase64Url(credential.rawId),
    response: {
      authenticatorData: bufferToBase64Url(response.authenticatorData),
      clientDataJSON: bufferToBase64Url(response.clientDataJSON),
      signature: bufferToBase64Url(response.signature),
      userHandle
    },
    authenticatorAttachment: credential.authenticatorAttachment ?? null,
    clientExtensionResults: credential.getClientExtensionResults(),
    type: credential.type
  };
};

export const base64urlEncode = bufferToBase64Url;
export const base64urlDecode = base64UrlToBuffer;
