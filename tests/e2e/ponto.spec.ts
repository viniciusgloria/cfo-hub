import { test, expect, chromium } from '@playwright/test';

test.setTimeout(60_000);

test('fluxo ponto: entrada -> inicio intervalo -> fim intervalo -> saida', async () => {
  // Configura contexto com permissão de geolocalização para evitar prompt
  const browser = await chromium.launch();
  const context = await browser.newContext({
    geolocation: { latitude: -27.5945, longitude: -48.5477 },
    permissions: ['geolocation'],
  });
  const page = await context.newPage();

  // Primeiro faz login (mock) e depois navega até a página de ponto
  await page.goto('http://localhost:5173/login');
  await page.fill('input[type="email"]', 'test@cfocompany.com');
  await page.fill('input[type="password"]', 'password');
  await page.click('text=Entrar');
  // aguardar redirecionamento
  await page.waitForURL('**/dashboard', { timeout: 5000 });
  await page.goto('http://localhost:5173/ponto');
  // Aguardar a página carregar e mostrar horário
  await expect(page.locator('text=Horário Atual')).toBeVisible({ timeout: 5000 });

  // Registrar Entrada
  await page.click('text=Entrada');
  await expect(page.locator('text=Entrada registrada às')).toBeVisible({ timeout: 5000 });

  // Iniciar intervalo
  await page.click('text=Iniciar Intervalo');
  await expect(page.locator('text=Intervalo iniciado às')).toBeVisible({ timeout: 5000 });

  // Encerrar intervalo
  await page.click('text=Encerrar Intervalo');
  await expect(page.locator('text=Intervalo finalizado às')).toBeVisible({ timeout: 5000 });

  // Registrar Saída
  await page.click('text=Saída');
  await expect(page.locator('text=Entrada e saída registrados!')).toBeVisible({ timeout: 5000 });

  // Validar que existe uma linha no espelho com a data de hoje
  const today = new Date().toLocaleDateString('pt-BR');
  await expect(page.locator('table')).toContainText(today);

  await context.close();
  await browser.close();
});
