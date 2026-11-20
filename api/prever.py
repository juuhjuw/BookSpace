import json
import sys
from pathlib import Path

import joblib
import pandas as pd

caminho_modelo = (
    Path(__file__).resolve().parent.parent
    / "data"
    / "notebooks"
    / "modelo_classificacao.pkl"
)

dados = json.loads(sys.stdin.read())

arquivo = joblib.load(caminho_modelo)
modelo = arquivo["pipeline"]

entrada = pd.DataFrame([{
    "AG_AMEACA": dados["AG_AMEACA"],
    "AG_ENFOR": dados["AG_ENFOR"],
    "AG_FOGO": dados["AG_FOGO"]
}])

resultado = int(modelo.predict(entrada)[0])

print(json.dumps({
    "classificacao": resultado,
    "aviso": "Estimativa acadêmica. Não representa uma avaliação individual de risco."
}))