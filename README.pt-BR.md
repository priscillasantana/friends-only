# Friends Only

[English](README.md) · **Português**

Uma pequena extensão para Chrome/Brave que faz o Instagram e o Facebook mostrarem só as pessoas que você segue.

**Instagram**
- Sempre abre o feed **Seguindo** (mais recentes primeiro, sem algoritmo)
- Esconde a aba **Reels** e o **Explorar** (os reels dos seus amigos continuam aparecendo)
- Esconde posts **sugeridos** e as contas de "Sugestões para você"
- Esconde posts **patrocinados**

**Facebook**
- Sempre abre o feed **Amigos** (mais recentes primeiro, sem algoritmo)
- Esconde **Reels** e **Watch** (os vídeos dos seus amigos continuam aparecendo)
- Esconde posts, grupos e páginas **sugeridos** e "Pessoas que você talvez conheça"
- Esconde posts **patrocinados**

Cada site tem seu próprio botão de liga/desliga no menu da extensão (o ícone na barra do navegador), e cada opção pode ser ligada ou desligada separadamente.

A extensão só muda o que aparece na sua própria aba do navegador. Ela nunca pede sua senha e nunca acessa a API do Instagram ou do Facebook.

## Instalação

1. Baixe ou clone este repositório. Para baixar, clique em **Code → Download ZIP** aqui no GitHub e descompacte o arquivo.
2. Abra `chrome://extensions` (ou `brave://extensions`) digitando na barra de endereço.
3. Ative o **Modo do desenvolvedor** (Developer mode), no canto superior direito.
4. Clique em **Carregar sem compactação** (Load unpacked) e selecione esta pasta.

Depois de baixar uma atualização, clique no ícone de recarregar (↻) no cartão da extensão e recarregue o site. A versão instalada aparece no rodapé do menu da extensão e no cartão dela.

## Versões

A versão fica no `manifest.json` e deve ser atualizada a cada mudança.

- **2.0.1** Mostra o número da versão no menu da extensão.
- **2.0.0** Instagram e Facebook juntos numa só extensão, com liga/desliga por site. Suporte ao Facebook adicionado. Correções no Instagram: posts sugeridos somem por inteiro, e só o link da aba Reels é escondido, para os vídeos do feed continuarem visíveis.
- **1.0.0** Só Instagram.

## Organização

- `instagram.js` / `instagram.css` só rodam no instagram.com
- `facebook.js` / `facebook.css` só rodam no facebook.com
- `popup.html` / `popup.js` são o menu de configurações

## Limitações

- Funciona só no navegador, não nos aplicativos de celular.
- Nenhum dos dois sites marca de forma estável os posts sugeridos ou anúncios, então a extensão os reconhece pelos textos e pelos botões "Seguir"/"Participar" (em inglês, português e espanhol). O Facebook ainda embaralha o texto "Patrocinado". Mudanças no layout de qualquer um dos sites podem quebrar a detecção.
- Usa `instagram.com/?variant=following` e `facebook.com/?filter=friends&sk=h_chr` para abrir os feeds só de amigos.
