import pandas as pd
import sys

try:
    # Ler arquivo Excel
    df = pd.read_excel('Setembro_Freq.xlsm', engine='openpyxl')
    
    # Salvar como CSV
    df.to_csv('backend/frequencias_completas.csv', index=False, encoding='utf-8')
    
    print("✅ Conversão concluída")
    print(f"📊 Linhas: {len(df)}")
    print(f"📋 Colunas: {list(df.columns)[:10]}...")
    
except Exception as e:
    print(f"❌ Erro: {e}")
    print("Tentando com xlrd...")
    try:
        df = pd.read_excel('Setembro_Freq.xlsm', engine='xlrd')
        df.to_csv('backend/frequencias_completas.csv', index=False, encoding='utf-8')
        print("✅ Conversão concluída com xlrd")
    except Exception as e2:
        print(f"❌ Erro xlrd: {e2}")