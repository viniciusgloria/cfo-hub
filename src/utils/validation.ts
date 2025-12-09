// Simple validation helpers used across forms
export function onlyDigits(value: string) {
  return value.replace(/\D/g, '');
}

// CNPJ validation algorithm
export function isValidCNPJ(value: string) {
  const cnpj = onlyDigits(value);
  if (cnpj.length !== 14) return false;
  // reject known invalids
  if (/^(\d)\1+$/.test(cnpj)) return false;

  const calc = (cnpjPart: string) => {
    const nums = cnpjPart.split('').map((d) => parseInt(d, 10));
    let sum = 0;
    let pos = nums.length - 7;
    for (let i = nums.length - 1; i >= 0; i--) {
      sum += nums[i] * pos--;
      if (pos < 2) pos = 9;
    }
    const res = sum % 11;
    return res < 2 ? 0 : 11 - res;
  };

  const base = cnpj.slice(0, 12);
  const digit1 = calc(base);
  const digit2 = calc(base + String(digit1));

  return cnpj === base + String(digit1) + String(digit2);
}

export function maxLength(value: string, len: number) {
  return value.length <= len;
}

// format a CNPJ as 00.000.000/0000-00 while typing
export function formatCNPJ(value: string) {
  const nums = onlyDigits(value).slice(0, 14);
  let formatted = nums;
  if (nums.length > 2) formatted = nums.slice(0,2) + '.' + nums.slice(2);
  if (nums.length > 5) formatted = formatted.slice(0,6) + '.' + nums.slice(6);
  if (nums.length > 8) formatted = formatted.slice(0,10) + '/' + nums.slice(10);
  if (nums.length > 12) formatted = formatted.slice(0,15) + '-' + nums.slice(14);
  // fix incremental formatting for lengths shorter than branch points
  if (nums.length <= 2) formatted = nums;
  if (nums.length > 2 && nums.length <= 5) formatted = nums.slice(0,2) + '.' + nums.slice(2);
  if (nums.length > 5 && nums.length <= 8) formatted = nums.slice(0,2) + '.' + nums.slice(2,5) + '.' + nums.slice(5);
  if (nums.length > 8 && nums.length <= 12) formatted = nums.slice(0,2) + '.' + nums.slice(2,5) + '.' + nums.slice(5,8) + '/' + nums.slice(8);
  if (nums.length > 12) formatted = nums.slice(0,2) + '.' + nums.slice(2,5) + '.' + nums.slice(5,8) + '/' + nums.slice(8,12) + '-' + nums.slice(12);

  return formatted;
}

// CPF formatting: 000.000.000-00
export function formatCPF(value: string) {
  const nums = onlyDigits(value).slice(0, 11);
  if (nums.length <= 3) return nums;
  if (nums.length <= 6) return nums.slice(0,3) + '.' + nums.slice(3);
  if (nums.length <= 9) return nums.slice(0,3) + '.' + nums.slice(3,6) + '.' + nums.slice(6);
  return nums.slice(0,3) + '.' + nums.slice(3,6) + '.' + nums.slice(6,9) + '-' + nums.slice(9);
}

// Simple CPF validation (checksum)
export function isValidCPF(value: string) {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1+$/.test(cpf)) return false;

  const calc = (str: string) => {
    let sum = 0;
    for (let i = 0; i < str.length; i++) {
      sum += parseInt(str[i], 10) * (str.length + 1 - i);
    }
    const res = sum % 11;
    return res < 2 ? 0 : 11 - res;
  };

  const base = cpf.slice(0,9);
  const d1 = calc(base);
  const d2 = calc(base + String(d1));
  return cpf === base + String(d1) + String(d2);
}

// Phone formatting: support (00) 00000-0000 or (00) 0000-0000 depending on length
export function formatPhone(value: string) {
  const nums = onlyDigits(value).slice(0, 11);
  if (nums.length <= 2) return nums;
  if (nums.length <= 6) return `(${nums.slice(0,2)}) ${nums.slice(2)}`;
  if (nums.length <= 10) return `(${nums.slice(0,2)}) ${nums.slice(2,6)}-${nums.slice(6)}`;
  return `(${nums.slice(0,2)}) ${nums.slice(2,7)}-${nums.slice(7)}`;
}

// CEP formatting: 00000-000
export function formatCEP(value: string) {
  const nums = onlyDigits(value).slice(0,8);
  if (nums.length <= 5) return nums;
  return nums.slice(0,5) + '-' + nums.slice(5);
}

// Email validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Phone validation (10 or 11 digits)
export function validatePhone(phone: string): boolean {
  const nums = onlyDigits(phone);
  return nums.length === 10 || nums.length === 11;
}

// Fetch address data from ViaCEP API
export async function fetchAddressByCEP(cep: string): Promise<any> {
  try {
    const cleanCep = onlyDigits(cep);
    if (cleanCep.length !== 8) {
      return null;
    }
    
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    // Check if CEP was found (ViaCEP returns {erro: true} if not found)
    if (data.erro) {
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching address from ViaCEP:', error);
    return null;
  }
}
