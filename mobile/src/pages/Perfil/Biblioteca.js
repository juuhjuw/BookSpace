import React, { useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
    Pressable 
} from 'react-native';

import PIN from "./PIN";
import RedeApoio from '../AreaApoio'
import { CORES } from "../../theme";

export default function Biblioteca({ navigation }) {

    const [mostrarPIN, setMostrarPIN] = useState(false);
    const [acessoLiberado, setAcessoLiberado] = useState(false);

    if (mostrarPIN && !acessoLiberado) {
        return (
            <PIN
                navigation={navigation}
                onVoltar={() => setMostrarPIN(false)}
                onSucesso={() => {
                setAcessoLiberado(true);
                setMostrarPIN(false);
                  }}
            />
        );
    }
    if (acessoLiberado) {
        navigation.navigate("AreaApoio");
        setAcessoLiberado(false);
        return null;
    }
    
  return (
    <View style={estilo.container}>

      <ScrollView
        style={estilo.content}
        showsVerticalScrollIndicator={false}
      >

        <View style={estilo.topo}>
          <Text style={estilo.sino}>🔔</Text>
        </View>

        <TextInput
          style={estilo.pesquisa}
          placeholder="Buscar títulos, autores..."
          placeholderTextColor="#777"
        />


        <Text style={estilo.tituloSecao}>
          Continue lendo
        </Text>

        <View style={estilo.livrosLinha}>

          <View style={estilo.livroContainer}>
            <TouchableOpacity
              style={[estilo.capa, estilo.roxo]}
            >
              <Text style={estilo.genero}>ROMANCE</Text>

              <View style={estilo.infoLivro}>
                <Text style={estilo.nomeLivro}>
                  É assim que acaba
                </Text>

                <Text style={estilo.autor}>
                  Colleen Hoover
                </Text>
              </View>
            </TouchableOpacity>

            <View style={estilo.barraFundo}>
              <View
                style={[
                  estilo.barraProgresso,
                  { width: '62%' },
                ]}
              />
            </View>

            <Text style={estilo.progresso}>
              62% lido
            </Text>
          </View>

          {/* Livro 2 */}
          <View style={estilo.livroContainer}>
            <TouchableOpacity
              style={[estilo.capa, estilo.laranja]}
            >
              <Text style={estilo.genero}>
                DRAMA
              </Text>

              <View style={estilo.infoLivro}>
                <Text style={estilo.nomeLivro}>
                  A Culpa é das Estrelas
                </Text>

                <Text style={estilo.autor}>
                  John Green
                </Text>
              </View>
            </TouchableOpacity>

            <View style={estilo.barraFundo}>
              <View
                style={[
                  estilo.barraProgresso,
                  { width: '30%' },
                ]}
              />
            </View>

            <Text style={estilo.progresso}>
              30% lido
            </Text>
          </View>

        </View>

        {/* POPULARES */}
        <Text style={estilo.tituloSecao}>
          Populares
        </Text>

        {/*Linha 1*/}
        <View style={estilo.livrosLinha}>
        <View style={estilo.livroContainer}>

          <TouchableOpacity
            style={[estilo.capa, estilo.azul]}
          >
            <Text style={estilo.genero}>
              AVENTURA
            </Text>

            <View style={estilo.infoLivro}>
              <Text style={estilo.nomeLivro}>
                Harry Potter e a Pedra Filosofal
              </Text>

              <Text style={estilo.autor}>
                J. K. Rowling
              </Text>
            </View>
          </TouchableOpacity>

          <Text style={estilo.avaliacao}>
            ★ 4.6
          </Text>

        </View>
        
        <View style={estilo.livroContainer}>

          <TouchableOpacity
            style={[estilo.capa, estilo.roxo]}
          >
            <Text style={estilo.genero}>
              CLÁSSICOS
            </Text>

            <View style={estilo.infoLivro}>
              <Text style={estilo.nomeLivro}>
                O Pequeno Príncipe
              </Text>

              <Text style={estilo.autor}>
                Antoine de Saint-Exupéry
              </Text>
            </View>
          </TouchableOpacity>

          <Text style={estilo.avaliacao}>
            ★ 4.4
          </Text>

        </View>

        <View style={estilo.livroContainer}>

          <TouchableOpacity
            style={[estilo.capa, estilo.laranja]}
          >
            <Text style={estilo.genero}>
              CLÁSSICO
            </Text>

            <View style={estilo.infoLivro}>
              <Text style={estilo.nomeLivro}>
                O Hobbit
              </Text>

              <Text style={estilo.autor}>
                J. R. R. Tolkien
              </Text>
            </View>
          </TouchableOpacity>

          <Text style={estilo.avaliacao}>
            ★ 4.2
          </Text>

        </View>
         <View style={estilo.livroContainer}>

          <TouchableOpacity
            style={[estilo.capa, estilo.azul]}
          >
            <Text style={estilo.genero}>
              AVENTURA
            </Text>

            <View style={estilo.infoLivro}>
              <Text style={estilo.nomeLivro}>
                Jogos Vorazes
              </Text>

              <Text style={estilo.autor}>
                Suzanne Collins
              </Text>
            </View>
          </TouchableOpacity>

          <Text style={estilo.avaliacao}>
            ★ 5.0
          </Text>

            </View>
        </View>

         {/*Linha 2*/}
         <View style={estilo.livrosLinha}>
        <View style={estilo.livroContainer}>

          <TouchableOpacity
            style={[estilo.capa, estilo.roxo]}
          >
            <Text style={estilo.genero}>
              FANTASIA
            </Text>

            <View style={estilo.infoLivro}>
              <Text style={estilo.nomeLivro}>
                Crepúsculo
              </Text>

              <Text style={estilo.autor}>
                Stephenie Meyer
              </Text>
            </View>
          </TouchableOpacity>

          <Text style={estilo.avaliacao}>
            ★ 4.1
          </Text>

        </View>
        
        <View style={estilo.livroContainer}>

          <TouchableOpacity
            style={[estilo.capa, estilo.laranja]}
          >
            <Text style={estilo.genero}>
              Suspense
            </Text>

            <View style={estilo.infoLivro}>
              <Text style={estilo.nomeLivro}>
                Verity
              </Text>

              <Text style={estilo.autor}>
                Colleen Hoover
              </Text>
            </View>
          </TouchableOpacity>

          <Text style={estilo.avaliacao}>
            ★ 3.6
          </Text>

        </View>

        <View style={estilo.livroContainer}>

          <TouchableOpacity
            style={[estilo.capa, estilo.azul]}
          >
            <Text style={estilo.genero}>
              TERROR
            </Text>

            <View style={estilo.infoLivro}>
              <Text style={estilo.nomeLivro}>
                It: A Coisa
              </Text>

              <Text style={estilo.autor}>
                Stephen King
              </Text>
            </View>
          </TouchableOpacity>

          <Text style={estilo.avaliacao}>
            ★ 3.2
          </Text>

        </View>
         <View style={estilo.livroContainer}>

        <TouchableOpacity
            style={[estilo.capa, estilo.roxo]}
            onLongPress={() => setMostrarPIN(true)}
        >
            <Text style={estilo.genero}>
              ROMANCE
            </Text>

            <View style={estilo.infoLivro}>
              <Text style={estilo.nomeLivro}>
                Os Sete Maridos de Evelyn Hugo
              </Text>

              <Text style={estilo.autor}>
                Taylor Jenkins Reid
              </Text>
            </View>
          </TouchableOpacity>

          <Text style={estilo.avaliacao}>
            ★ 4.0
          </Text>

            </View>
        </View>

         {/*Linha 3*/}
         <View style={estilo.livrosLinha}>
        <View style={estilo.livroContainer}>

          <TouchableOpacity
            style={[estilo.capa, estilo.laranja]}
          >
            <Text style={estilo.genero}>
              EMOCIONANTES
            </Text>

            <View style={estilo.infoLivro}>
              <Text style={estilo.nomeLivro}>
                O Menino do Pijama Listrado
              </Text>

              <Text style={estilo.autor}>
                John Boyne
              </Text>
            </View>
          </TouchableOpacity>

          <Text style={estilo.avaliacao}>
            ★ 5.0
          </Text>

        </View>
        
        <View style={estilo.livroContainer}>

          <TouchableOpacity
            style={[estilo.capa, estilo.azul]}
          >
            <Text style={estilo.genero}>
             FICÇÃO CIENTÍFICA
            </Text>

            <View style={estilo.infoLivro}>
              <Text style={estilo.nomeLivro}>
                A Cura Mortal
              </Text>

              <Text style={estilo.autor}>
               James Dashner
              </Text>
            </View>
          </TouchableOpacity>

          <Text style={estilo.avaliacao}>
            ★ 4.6
          </Text>

        </View>

        <View style={estilo.livroContainer}>

          <TouchableOpacity
            style={[estilo.capa, estilo.roxo]}
          >
            <Text style={estilo.genero}>
             Romantasia
            </Text>

            <View style={estilo.infoLivro}>
              <Text style={estilo.nomeLivro}>
                Coroa da Meia-Noite
              </Text>

              <Text style={estilo.autor}>
                Sarah J. Maas
              </Text>
            </View>
          </TouchableOpacity>

          <Text style={estilo.avaliacao}>
            ★ 4.9
          </Text>

        </View>
         <View style={estilo.livroContainer}>

          <TouchableOpacity
            style={[estilo.capa, estilo.azul]}
          >
            <Text style={estilo.genero}>
              MÁGIA
            </Text>

            <View style={estilo.infoLivro}>
              <Text style={estilo.nomeLivro}>
                O Senhor dos Anéis: As Duas Torres
              </Text>

              <Text style={estilo.autor}>
                J. R. R. Tolkien
              </Text>
            </View>
          </TouchableOpacity>

          <Text style={estilo.avaliacao}>
            ★ 3.9
          </Text>

            </View>
        </View>

        <View style={{ height: 100 }} />

      </ScrollView>


      <View style={estilo.menu}>

        <TouchableOpacity
          style={estilo.menuItem}
          onPress={() => navigation.navigate('Home')}
        >
          <Text>🏠</Text>
          <Text style={estilo.menuTexto}>
            Início
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={estilo.menuItem}
          onPress={() => navigation.navigate('Buscar')}
        >
          <Text>🔍</Text>
          <Text style={estilo.menuTexto}>
            Buscar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={estilo.menuItem}
          onPress={() => navigation.navigate('Biblioteca')}
        >
          <Text>📚</Text>
          <Text style={estilo.menuTexto}>
            Biblioteca
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={estilo.menuItem}
          onPress={() => navigation.navigate('Perfil')}
        >
          <Text>👤</Text>
          <Text style={estilo.menuTexto}>
            Perfil
          </Text>
        </TouchableOpacity>

      </View>

    </View>
  );
}

const estilo = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: CORES.fundo,
  },

  content: {
    flex: 1,
    paddingHorizontal: 29,
  },

  topo: {
    alignItems: 'flex-end',
    marginTop: 15,
    marginBottom: 18,
  },

  sino: {
    fontSize: 11,
  },

  pesquisa: {
    height: 40,
    borderWidth: 1,
    borderColor: CORES.borda,
    borderRadius: 22,
    paddingHorizontal: 16,
    backgroundColor: CORES.branco,
    fontSize: 14,
    color: CORES.texto,
  },

  tituloSecao: {
    fontSize: 13,
    fontWeight: 'bold',
    color: CORES.roxo,
    marginTop: 18,
    marginBottom: 11,
  },

  livrosLinha: {
    flexDirection: 'row',
    gap: 9,
  },

  livroContainer: {
    width: 98,
  },

  capa: {
    width: 98,
    height: 147,
    borderRadius: 7,
    padding: 8,
    justifyContent: 'space-between',
  },

  roxo: {
    backgroundColor: '#6D2585',
  },

  laranja: {
    backgroundColor: '#C55A1D',
  },

  azul: {
    backgroundColor: '#147696',
  },

  genero: {
    color: '#EDE7EF',
    fontSize: 7,
    letterSpacing: 0.5,
  },

  infoLivro: {
    marginBottom: 0,
  },

  nomeLivro: {
    color: CORES.branco,
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 2,
  },

  autor: {
    color: '#E6DDE9',
    fontSize: 8,
  },

  barraFundo: {
    height: 4,
    backgroundColor: '#E1DDE2',
    borderRadius: 5,
    marginTop: 4,
  },

  barraProgresso: {
    height: 4,
    backgroundColor: '#F2A900',
    borderRadius: 5,
  },

  progresso: {
    fontSize: 12,
    color: CORES.textoSecundario,
    marginTop: 5,
  },

  avaliacao: {
    fontSize: 12,
    color: CORES.textoSecundario,
    marginTop: 5,
  },

  menu: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 55,
    backgroundColor: CORES.branco,
    borderTopWidth: 1,
    borderTopColor: CORES.borda,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  menuItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  menuTexto: {
    fontSize: 9,
    color: CORES.textoSecundario,
    marginTop: 3,
  },

});