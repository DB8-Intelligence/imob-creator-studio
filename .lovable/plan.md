

## Usar Mockups Reais nos Templates

Substituir os templates atuais (que usam placeholders genéricos) por imagens reais de mockups profissionais de criativos imobiliários, dando ao usuário uma visão realista do que será gerado.

### O que muda

1. **Copiar as 8 imagens para o projeto** na pasta `src/assets/templates/`
2. **Atualizar a Landing Page (TemplatesSection)** -- substituir os componentes de template por cards com as imagens reais, organizados por formato (Feed, Stories, Reels)
3. **Atualizar a pagina de Templates (/templates)** -- o preview lateral passa a mostrar as imagens mockup correspondentes ao formato selecionado, com navegação entre variações
4. **Manter os componentes de template existentes** para uso no Editor (onde o usuário personaliza textos), mas a vitrine agora usa as imagens reais

### Organizacao das imagens

| Formato | Imagens |
|---------|---------|
| Feed (1080x1080) | `template_post_feed_2-3.png`, `template_post_feed_3-3.png`, `exemplo_criativo_db8-3.png` |
| Stories (1080x1920) | `template_story_1-3.png`, `template_story_2-3.png`, `template_story_3-3.png` |
| Reels (1080x1920) | `template_reels_1-3.png`, `template_reels_2-3.png` |

### Detalhes tecnicos

- Imagens copiadas para `src/assets/templates/` e importadas como modulos ES6
- **TemplatesSection.tsx**: grid de cards com as imagens, hover overlay mantido, labels por formato
- **Templates.tsx (pagina /templates)**: no painel de preview, exibir galeria das imagens mockup do formato selecionado (feed/story/reels) com navegacao por setas ou dots, em vez dos componentes SquarePostTemplate/StoryTemplate/CarouselTemplate
- Aspect ratio correto aplicado: 1:1 para feed, 9:16 para stories/reels
- Imagens otimizadas pelo bundler Vite automaticamente

