# Dados e modelo

O notebook `notebooks/notebook.ipynb` documenta a origem, governança, limpeza, análise exploratória e classificação demonstrativa usando o arquivo público do SINAN — Violência Interpessoal/Autoprovocada, notificações de 2024, recortado e anonimizado pelo grupo. Os CSVs versionados em `notebooks/dados/` são os dados de entrada e a saída tratada usada pelo notebook; `raw/` é reservado para arquivos originais e não contém microdados locais omitidos do repositório.

O alvo `OUT_VEZES` indica se a violência já havia ocorrido outras vezes na notificação. Ele não representa violência futura e não permite avaliar risco individual. O modelo de regressão logística foi treinado em três indicadores registrados (`AG_AMEACA`, `AG_ENFOR`, `AG_FOGO`), com imputação dentro do pipeline, holdout estratificado de 20% e validação cruzada estratificada de cinco folds. O notebook contém as métricas e gráficos gerados. O modelo teve F1 médio 0,5816 e acurácia média 0,5376 na validação cruzada, abaixo do baseline de acurácia 0,7234; portanto, sua capacidade preditiva é limitada.

## Reproduzir

Requer Python 3.11–3.13. No PowerShell, na raiz do repositório:

```powershell
py -3.12 -m venv data\notebooks\.venv
data\notebooks\.venv\Scripts\python -m pip install -r data\requirements.txt
data\notebooks\.venv\Scripts\python -m jupyter lab data\notebooks\notebook.ipynb
```

No Jupyter, execute todas as células em ordem. A célula final treina o pipeline e atualiza `modelo_classificacao.pkl`. O caminho da fonte de dados deve permanecer `data/notebooks/dados/`; o notebook inclui uma busca alternativa para a etapa de carga e é recomendado executá-lo com `data/notebooks` como diretório de trabalho.

O app recebe apenas estatísticas agregadas e métricas publicadas pelo endpoint `/modelo/contexto`. Não envia respostas pessoais ao classificador e não exibe uma classificação individual. O contexto apresentado é acadêmico, referente às notificações disponíveis na base, e não deve ser interpretado como diagnóstico ou estimativa de perigo.
