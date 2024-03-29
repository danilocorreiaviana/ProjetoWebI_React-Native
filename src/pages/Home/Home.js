import React from "react";
import { StatusBar } from 'expo-status-bar';
import { Text, View, Image, TouchableOpacity, SafeAreaView, FlatList, Button} from 'react-native';
import { useState,useEffect} from 'react';
import { Searchbar } from 'react-native-paper';

import { styles } from './Styles';
import Produtos from './../../components/Produtos';
import { Load } from '../../components/Load';
import { apiMercado } from '../../config';

import DateTimePickerModal from "react-native-modal-datetime-picker";


export const Home = ({navigation}) => {

  const dateFormat = (date) =>{
    const dia  = date.getDate().toString();
    const diaF = (dia.length == 1) ? '0'+dia : dia;
    const mes  = (date.getMonth()+1).toString();
    const mesF = (mes.length == 1) ? '0'+mes : mes;
    const anoF = date.getFullYear();
    return Number(anoF+mesF+diaF);
  }
  
  const [resultado, setResultado] = useState([]);
  const [textsearch, setTextSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const imageCart = require("./../../assets/shopping_cart.png")
  const imageTracking = require("./../../assets/tracking.png")
  const notfound = require("./../../assets/notfound.png")
  
  const [open, setOpen] = useState(false);
  const [dateSelect, setDateSelect] = useState(new Date());
  const [restore,setRestore] = useState([])

  const dateProductsDate = (date) =>{
    setResultado([])
    setLoading(true)
    let url = 'items?ids=';
    resultado.map((item,index) => {
      index < 1 ? url += item.id : index<20? url += ','+item.id : false
    })
    let ids=[];
    let urlf ='items?ids='
    apiMercado.get(url)
    .then(({ data }) => {
      data.map((res) => {
        const datawithouthour = res.body.date_created.toLocaleString().substr(0, 10)
        const dataS = datawithouthour.toString().replace('-','')
        const dataString = dataS.replace('-','')
        if(Number(dataString)>=dateFormat(date)){
          console.log(dataString)
          console.log(dateFormat(date))
          ids.push(res.body.id)
        }
      })
      ids.map((item, index) => {
        index < 1 ? urlf += item : index<20? urlf += ','+item : false
      })
      if(ids.length===0){
        setLoading(false)
        return false;
      }
      apiMercado.get(urlf)
      .then(({ data }) => {
        data.map((res) => {
          setResultado(filter => [...filter, {
            id: res.body.id,
            title: res.body.title,
            thumbnail: res.body.thumbnail,
            price: res.body.price,    
          }])
        })
      })
    })

  }
  
  const openFilter = () =>{
    setOpen(true);
    setResultado(restore);
    //comentário
    
   
  }
  const handleConfirm = (date) => {
    setOpen(false);
    setDateSelect(date);
    dateProductsDate(date);

  };


  const produtos = () =>{
    if(textsearch===""){
      return false
    }
    let url = `sites/MLB/search?q=${textsearch}`;
    setResultado([]);
    setLoading(true)
    apiMercado.get(url)
    .then(({ data }) => {
      setResultado(data.results);
      setRestore(data.results);
      setLoading(false)
    })

  }

  const openProduto = id =>{

    apiMercado.get(`items/${id}`)
    .then(({ data }) => {
    let i = data
    navigation.navigate("Detalhes",{info:i}) 
    
    })
    
  }

  const getItems = ()=>{
    let url = `sites/MLB/search?q=eletronicos`;
    setLoading(true)
    apiMercado.get(url)
    .then(({ data }) => {
      setResultado(data.results);
      setRestore(data.results);
      setLoading(false)
      
   })
  }

  useEffect(() => {
    if (resultado.length===0 && textsearch===""){
      getItems();
    }
  }, []);

  const renderItem = ({ item }) => (
    <Produtos
      title={item.title}
      thumbnail={item.thumbnail}
      price={item.price}
      id={item.id}
      navigation={navigation} 
      openProduto={openProduto}
    />
  );

  return (

    <View style={{flex:1}}>
      <StatusBar
        style = "auto"
        hidden = {false}
        backgroundColor = "rgb(3,147,213)"
        translucent = {false}
        networkActivityIndicatorVisible = {true}
      />
      
      <View style={styles.containerSearch}>

        <Searchbar
            style={styles.searchBar}
            placeholder="Busque por um produto..."
            onChangeText={setTextSearch}
            onSubmitEditing={produtos}
            value={textsearch}
        
        />

        <View style={styles.viewFilter}>
          <TouchableOpacity style={styles.buttonFilter} onPress={openFilter}>
                <Text style={styles.textFilter}> Filtrar por data</Text>
          </TouchableOpacity>
          {/* <TouchableOpacity style={styles.buttonFilter} >
                <Text style={styles.textFilter}> Ordenar por preço</Text>
          </TouchableOpacity> */}
        </View>

        <DateTimePickerModal
          date={dateSelect}
          isVisible={open}
          mode="date"
          onConfirm={handleConfirm}
          onCancel={()=>setOpen(false)}
        />

      </View>

      {(resultado.length===0 && loading) && <Load />}
      {(resultado.length===0 && !loading)?

      <View style={styles.notfoundView}>
        <Image
        source={notfound}
        style={styles.notfoundImage}     
        /><Text style={styles.notfoundText}>Nenhum resultado encontrado</Text>
       </View>:false}

      <SafeAreaView style={styles.content}>
          <FlatList
            data={resultado}
            keyExtractor={(item) => item.id}
            numColumns={2}
            renderItem={renderItem}
            onEndReachedThreshold={0.1}
          />
      </SafeAreaView>
  
    </View>
  );
}
