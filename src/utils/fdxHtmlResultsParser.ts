import type { NomeConsultaResultado } from "@/services/buscaNomeService";

/**
 * Extrai resultados do HTML de `api.fdxapis.us/temp/...`.
 * O link normalmente traz uma tabela com colunas: Nome | CPF | Nascimento | ...
 */
export function parseFdxHtmlResults(html: string): NomeConsultaResultado[] {
  // DOMParser só existe no browser (esta função é usada no frontend)
  if (typeof window === "undefined" || typeof DOMParser === "undefined") return [];

  const doc = new DOMParser().parseFromString(html, "text/html");

  // Em geral existe apenas 1 tabela principal de resultados.
  const table = doc.querySelector("table");
  if (!table) return [];

  const rows = Array.from(table.querySelectorAll("tbody tr"));
  if (rows.length === 0) {
    // fallback: algumas páginas podem não ter <tbody>
    const fallbackRows = Array.from(table.querySelectorAll("tr")).slice(1);
    return fallbackRows.map(parseRow).filter(Boolean) as NomeConsultaResultado[];
  }

  return rows.map(parseRow).filter(Boolean) as NomeConsultaResultado[];
}

function parseRow(tr: HTMLTableRowElement): NomeConsultaResultado | null {
  const tds = Array.from(tr.querySelectorAll("td"));
  if (tds.length < 3) return null;

  const rawNome = normalizeText(tds[0]?.textContent || "");
  const rawCpf = normalizeText(tds[1]?.textContent || "");
  const rawNasc = normalizeText(tds[2]?.textContent || "");

  // Nome costuma vir em múltiplas linhas (sigla, nome, ID...)
  const nomeLines = rawNome
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const nome = (nomeLines.length >= 2 ? nomeLines[1] : nomeLines[0] || "").trim();

  // Nascimento costuma vir como "dd/mm/aaaa\nXX anos"
  const nascimento = extractDate(rawNasc) || (rawNasc.split("\n")[0] || "").trim();

  if (!nome && !rawCpf && !nascimento) return null;

  // Interface exige campos extras; como a tela só exibe Nome/CPF/Nascimento,
  // mantemos os demais como string vazia para evitar payloads gigantes.
  return {
    nome: nome || "-",
    cpf: rawCpf || "-",
    nascimento: nascimento || "-",
    idade: "",
    sexo: "",
    enderecos: "",
    cidades: "",
  };
}

function normalizeText(value: string): string {
  return (value || "")
    .replace(/\r/g, "")
    .replace(/\t/g, " ")
    .replace(/\u00a0/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .trim();
}

function extractDate(text: string): string | null {
  const m = text.match(/\b\d{2}\/\d{2}\/\d{4}\b/);
  return m?.[0] ?? null;
}
