import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Linking } from 'react-native';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  Alert,
  TextInput,
  Button,
  Platform
} from 'react-native';

export default function App() {
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const [nome, setNome] = useState('');
  const [endereco, setEndereco] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [usuarioEditando, setUsuarioEditando] = useState(null);

  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/users')
      .then((response) => response.json())
      .then((data) => {
        setUsuarios(data);
        setCarregando(false);
      })
      .catch((error) => {
        console.error('Erro ao buscar dados:', error);
        setCarregando(false);
      });
  }, []);


    const pegarLocalizacao = () => {
    const confirmar = window.confirm(
        'Deseja permitir o acesso à sua localização?'
    );

    if (!confirmar) {
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (posicao) => {
        const latitudeAtual = posicao.coords.latitude;
        const longitudeAtual = posicao.coords.longitude;
        const precisao = posicao.coords.accuracy;

        setLatitude(String(latitudeAtual));
        setLongitude(String(longitudeAtual));

        console.log('Latitude:', latitudeAtual);
        console.log('Longitude:', longitudeAtual);
        console.log('Precisão (m):', precisao);
        },
        (erro) => {
        console.log(
            'Não foi possível obter a localização:',
            erro
        );

        window.alert(
            'Não foi possível obter a localização. Verifique a permissão do navegador.'
        );
        },
        {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
        }
    );
    };

  const abrirLocalizacao = () => {
    if (!latitude.trim() || !longitude.trim()) {
      Alert.alert(
        'Atenção',
        'Digite as coordenadas primeiro.'
      );
      return;
    }

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      Alert.alert(
        'Atenção',
        'Digite coordenadas válidas.'
      );
      return;
    }

    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

    Linking.openURL(url).catch(() => {
      Alert.alert('Erro', 'Não foi possível abrir o mapa.');
    });
  };

  const adicionarUsuario = () => {
    if (!nome.trim() || !endereco.trim()) {
      Alert.alert(
        'Atenção',
        'Por favor, preencha o nome e o endereço.'
      );
      return;
    }

    const novoUsuario = {
      id: Date.now().toString(),
      name: nome,
      address: {
        street: endereco,
        suite: '',
        city: '',
        geo: {
          lat: latitude,
          lng: longitude,
        },
      },
    };

    setUsuarios((usuariosAtuais) => [
      novoUsuario,
      ...usuariosAtuais,
    ]);

    setNome('');
    setEndereco('');
    setLatitude('');
    setLongitude('');
  };

  const excluirUsuario = (id) => {
    if (Platform.OS === 'web') {
      const confirmar = window.confirm(
        'Tem certeza que deseja excluir este usuário?'
      );

      if (confirmar) {
        setUsuarios((usuariosAtuais) =>
          usuariosAtuais.filter((usuario) => usuario.id !== id)
        );
      }
    } else {
      Alert.alert(
        'Excluir usuário',
        'Tem certeza que deseja excluir este usuário?',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Excluir',
            onPress: () => {
              setUsuarios((usuariosAtuais) =>
                usuariosAtuais.filter((usuario) => usuario.id !== id)
              );
            },
          },
        ]
      );
    }
  };

  const alterarUsuario = (id) => {
    const usuario = usuarios.find(
      (usuario) => usuario.id === id
    );

    if (!usuario) return;

    setNome(usuario.name);
    setEndereco(usuario.address.street);
    setLatitude(usuario.address.geo?.lat || '');
    setLongitude(usuario.address.geo?.lng || '');
    setUsuarioEditando(id);
  };

  const salvarAlteracao = () => {
    if (!nome.trim() || !endereco.trim()) {
      Alert.alert(
        'Atenção',
        'Por favor, preencha o nome e o endereço.'
      );
      return;
    }

    const confirmarAlteracao = () => {
      setUsuarios((usuariosAtuais) =>
        usuariosAtuais.map((usuario) =>
          usuario.id === usuarioEditando
            ? {
                ...usuario,
                name: nome,
                address: {
                  ...usuario.address,
                  street: endereco,
                  geo: {
                    ...usuario.address.geo,
                    lat: latitude,
                    lng: longitude,
                  },
                },
              }
            : usuario
        )
      );

      setNome('');
      setEndereco('');
      setLatitude('');
      setLongitude('');
      setUsuarioEditando(null);
    };

    if (Platform.OS === 'web') {
      const confirmar = window.confirm(
        'Tem certeza que deseja alterar este usuário?'
      );

      if (confirmar) confirmarAlteracao();
    } else {
      Alert.alert(
        'Confirmar alteração',
        'Tem certeza que deseja alterar este usuário?',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Alterar',
            onPress: confirmarAlteracao,
          },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Sistema de Cadastro</Text>
      <Text style={styles.subtitulo}>Maria Vitoria e João Pedro</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome"
        value={nome}
        onChangeText={setNome}
      />

      <TextInput
        style={styles.input}
        placeholder="Endereço"
        value={endereco}
        onChangeText={setEndereco}
      />

      <TextInput
        style={styles.input}
        placeholder="Latitude"
        value={latitude}
        onChangeText={setLatitude}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="Longitude"
        value={longitude}
        onChangeText={setLongitude}
        keyboardType="numeric"
      />

      <Button
        title="LOCALIZAÇÃO"
        onPress={pegarLocalizacao}
        color="#8f7ff7"
      />

      <View style={{ marginBottom: 10 }} />

      <Button
        title="ABRIR NO MAPA"
        onPress={abrirLocalizacao}
        color="#8f7ff7"
      />

      <View style={{ marginBottom: 10 }} />

      {usuarioEditando === null ? (
        <Button
          title="Adicionar usuário"
          onPress={adicionarUsuario}
          color="#8f7ff7"
        />
      ) : (
        <>
          <Button
            title="Salvar alteração"
            onPress={salvarAlteracao}
            color="#2bb815"
          />

          <Button
            title="Cancelar"
            onPress={() => {
              setNome('');
              setEndereco('');
              setLatitude('');
              setLongitude('');
              setUsuarioEditando(null);
            }}
            color="#df2929"
          />
        </>
      )}

      {carregando ? (
        <ActivityIndicator
          size="large"
          color="#c285ff"
        />
      ) : (
        <FlatList
          data={usuarios}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.nome}>
                {item.name}
              </Text>

              <Text style={styles.endereco}>
                {item.address.street}
                {item.address.suite
                  ? `, ${item.address.suite}`
                  : ''}
                {item.address.city
                  ? ` - ${item.address.city}`
                  : ''}
              </Text>

              <Text style={styles.endereco}>
                Latitude: {item.address.geo?.lat}
              </Text>

              <Text style={styles.endereco}>
                Longitude: {item.address.geo?.lng}
              </Text>

              <View style={styles.botoesContainer}>
                <View style={styles.botao}>
                  <Button
                    title="Alterar"
                    onPress={() => alterarUsuario(item.id)}
                    color="#1e54ab"
                  />
                </View>

                <View style={styles.botao}>
                  <Button
                    title="Excluir"
                    onPress={() => excluirUsuario(item.id)}
                    color="#df2929"
                  />
                </View>
              </View>
            </View>
          )}
          style={styles.lista}
        />
      )}

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#260360',
    paddingTop: 15,
    paddingHorizontal: 20,
  },

  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    color: '#bdaef4',
  },

  subtitulo: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: -8,
    marginBottom: 20,
    color: '#bdaef4',
  },

  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },

  lista: {
    width: '100%',
    marginTop: 20,
  },

  card: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#0e3987',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },

  nome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },

  endereco: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },

  botoesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },

  botao: {
    flex: 1,
  },
});
