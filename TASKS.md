# Backlog de melhorias identificadas

## 1) Corrigir erro ortográfico (documentação)
- **Problema detectado:** o README contém erros de escrita que prejudicam clareza e credibilidade, como `abliges` e `to you web testing`.
- **Impacto:** confusão para novos utilizadores e documentação menos profissional.
- **Tarefa proposta:** revisar e corrigir ortografia/gramática no `README.md`, mantendo o sentido original e padronizando inglês técnico.
- **Critério de aceite:** README sem erros ortográficos evidentes nos parágrafos introdutórios e de instalação.

## 2) Corrigir bug funcional no preenchimento de formulários
- **Problema detectado:** `fillOne` retorna cedo com `if (!value)`, o que ignora valores válidos como `false`, `0` e string vazia.
- **Impacto:** não é possível preencher campos booleanos para `false` (quando isolados), números `0` e campos de texto vazios de forma explícita.
- **Tarefa proposta:** alterar a guarda para ignorar apenas `undefined` (e eventualmente `null`, se a API desejar), preservando o tratamento de `false`, `0` e `""`.
- **Critério de aceite:** `fillOne("iCanDrive", false)`, `fillOne("age", 0)` e `fillOne("name", "")` executam sem early-return indevido.

## 3) Corrigir comentário de código / discrepância de documentação inline
- **Problema detectado:** comentários JSDoc em componentes usam termos com erro ortográfico (`acessible`, `insencitive`) e podem induzir uso incorreto.
- **Impacto:** documentação de API menos confiável para quem usa IntelliSense e lê exemplos.
- **Tarefa proposta:** revisar JSDoc em `src/components/dialog.ts` e `src/components/table.ts`, corrigindo termos para `accessible` e `insensitive`, além de ajustes menores de redação.
- **Critério de aceite:** comentários JSDoc sem erros ortográficos nesses arquivos e exemplos coerentes.

## 4) Melhorar cobertura de teste para prevenir regressão
- **Problema detectado:** não há teste que valide explicitamente o cenário `fillOne` com valores falsy (`false`, `0`, `""`).
- **Impacto:** regressões nesse comportamento podem passar despercebidas.
- **Tarefa proposta:** adicionar casos em `tests/components/form/form.spec.ts` cobrindo `fillOne` com `false` e `0`; opcionalmente incluir string vazia quando fizer sentido para o HTML de fixture.
- **Critério de aceite:** novos testes falham antes da correção do bug e passam após ajuste da lógica de guarda.
