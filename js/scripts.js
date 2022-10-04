
$(function(){

    function pegarValoresGrafico(cod){
      $.ajax({
          url: "https://brapi.dev/api/quote/" + cod + "?range=5d&interval=5d&fundamental=true",
          type: "GET",
          dataType: "json",
          success: function(data){
              let precos = [];
              let datas = [];
              let dados = data.results[0].historicalDataPrice;           

              for (let i = 0; i < dados.length; i++){
                precos.push(data.results[0].historicalDataPrice[i].close);
                let dataFormatada = formataData(data.results[0].historicalDataPrice[i].date);
                datas.push(dataFormatada);
              }
              gerarGrafico2(precos, datas);
              $('.refresh-loader').hide();
          },
          error: function(){
              gerarErro("Código inválido");
          }

      });
    }

    function formataData(data){
      let dataFormatada = parseInt(data * 1000);
      dataFormatada = new Date(dataFormatada).toLocaleDateString("pt-BR");
      return dataFormatada;
    }

    

    function gerarGrafico2(data, preco){         
              Highcharts.chart('container', {
                  chart: {
                      zoomType: 'x'
                  },
                  title: {
                      text: 'Cotação dos últimos dias'
                  },
                  xAxis: {
                      type: 'datetime',
                      categories: preco
                      
                  },
                  yAxis: {
                      title: {
                          text: 'Preço R$'
                      }
                  },
                  plotOptions: {
                      area: {
                          fillColor: {
                              linearGradient: {
                                  x1: 0,
                                  y1: 0,
                                  x2: 0,
                                  y2: 1
                              },
                              stops: [
                                  [0, Highcharts.getOptions().colors[0]],
                                  [1, Highcharts.color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                              ]
                          },
                          marker: {
                              radius: 2
                          },
                          lineWidth: 1,
                          states: {
                              hover: {
                                  lineWidth: 1
                              }
                          },
                          threshold: null
                      }
                  },
      
                  series: [{
                      showInLegend: false,  
                      type: 'area',
                      name: 'R$',
                      data: data
                  }]
              });  
    }

    function formataData(data){
        let dataFormatada = parseInt(data * 1000);
        dataFormatada = new Date(dataFormatada).toLocaleDateString("pt-BR");
        return dataFormatada;
    }

    function pegarCotacoesEmpresas(cod){
      $.ajax({               
          url: "https://brapi.dev/api/quote/" + cod + "?range=5d&interval=5d&fundamental=true",
          type: "GET",
          dataType: "json",
          success: function(data){

            let nomeCompleto = data.results[0].longName;
            let codi = data.results[0].symbol;
            let precoAbertura = data.results[0].regularMarketOpen;
            let precoAtual = data.results[0].regularMarketPrice;
            let precoMinima = data.results[0].regularMarketDayLow;
            let precoMaxima = data.results[0].regularMarketDayHigh;
            let variacaoPercentual = data.results[0].regularMarketChangePercent;

            preencherValoresEmpresa(precoAtual, codi, variacaoPercentual, nomeCompleto, precoAbertura, precoMinima, precoMaxima);
            cod = codi;
            $('.refresh-loader').hide();   
          },
          error: function(){
              gerarErro("Erro ao consultar valores para essa empresa");
          }
  
      });
  }

    function formatarValorMoeda (valor){
        let val = parseFloat(valor);
        val = val.toFixed(4);
        val = val.replace(".", ",");
        return val;
    }

    function preencherValoresEmpresa(precoAtual, codEmpresa, variacao, nomeCompleto, precoAbertura, precoMinima, precoMaxima){
        $("#texto_cod_empresa").html(codEmpresa);
        $("#texto_valor").html(precoAtual);
        $("#texto_nome_empresa").html(nomeCompleto);
        $("#texto_variacao_maxima").html(precoMaxima + " R$");
        $("#texto_variacao_minima").html(precoMinima + " R$");
        $("#texto_abertura").html(precoAbertura + " R$");

        if (variacao < 0){
           $("#icone_variacao").css("background-image", "url('img/dolar-baixa.png')" );
           $("#texto_variacao").html(variacao + " &percnt;");
           $("#texto_variacao").css("color", "red");
        } else {
            $("#icone_variacao").css("background-image", "url('img/dolar-alta.png')" );
            $("#texto_variacao").html(variacao + " &percnt;");
            $("#texto_variacao").css("color", "green");
        }

        window.setTimeout(function(){          
          let testanto = $("#texto_cod_empresa").html();
          if (testanto === codEmpresa){
          pegarCotacoesEmpresas(codEmpresa);
          }
        }, 6000);       

    }
  
    function gerarErro(mensagem){

        if(!mensagem){
            mensagem = "Erro na solicitação";
        }

        $('.refresh-loader').hide();
        $("#aviso-erro").text(mensagem);
        $("#aviso-erro").slideDown();
        window.setTimeout(function(){
            $("#aviso-erro").slideUp();
        }, 4000);

    }

    $("#search-button").click(function(){       
      var codEmpresa = $("#local").val().trim();
      codEmpresa = codEmpresa.replace(/ /g, "");
      if (codEmpresa){
        $('.refresh-loader').show();
        pegarCotacoesEmpresas(codEmpresa);
        pegarValoresGrafico(codEmpresa);
      } else {
          alert('Código inválido');
      }
    });

    $("#local").on('keypress', function(e){        
        if(e.which == 13){
            var codEmpresa = $("#local").val().trim();
            codEmpresa = codEmpresa.replace(/ /g, "");
            if (codEmpresa){
                $('.refresh-loader').show();
                pegarCotacoesEmpresas(codEmpresa);
                pegarValoresGrafico(codEmpresa);
            } else {
                alert('Código inválido');
            }
        }       
    });
       

    let test = $("#texto_cod_empresa").html().trim();
    if (test === "Sem dados para apresentar"){
      let codEmpresaPadrao = "mglu3";
      pegarCotacoesEmpresas(codEmpresaPadrao);
      pegarValoresGrafico(codEmpresaPadrao);
    }      

});