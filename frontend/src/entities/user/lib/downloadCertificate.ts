import { userApi } from '../api/user';

export const downloadCertificatePdf = async () => {
  const data = await userApi.downloadPaperCertificate();
  const blob = new Blob([data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'lasso-certificate.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
