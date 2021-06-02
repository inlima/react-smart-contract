import React, { useEffect, useState } from "react";
// Informação do contrato
import event from "../../contracts/event.contract";
// Configuração para requisições na rede
import web3 from "../../contracts/web3";
import "./style.css";

// Verifica se o numero é menor que 10 e poe um 0 na frente
const checkZero = (val) => {
  return val < 10 ? "0" + val : val;
};
// Função que transforma timestamp em dd/mm/yyyy hh:mm:ss
const converteHorario = (date) => {
  var data = new Date(date);
  var hours = data.getHours();
  var minutes = "0" + data.getMinutes();
  var seconds = "0" + data.getSeconds();
  var ddmmmyyyy =
    checkZero(data.getDate()) +
    "/" +
    checkZero(data.getMonth() + 1) +
    "/" +
    data.getFullYear();
  var formattedTime =
    ddmmmyyyy +
    " " +
    hours +
    ":" +
    minutes.substr(-2) +
    ":" +
    seconds.substr(-2);

  return formattedTime;
};

function Home() {
  const [events, setEvents] = useState([]);
  const [loadingCreateEvent, setLoadingCreateEvent] = useState(false);
  const [loadingBuyEvent, setLoadingBuyEvent] = useState(false);
  const [price, setPrice] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [quantity, setQuantity] = useState("");
  const [ticketCount, setTicketCount] = useState("");
  const [eventPosition, setEventPosition] = useState("");
  const [eventInfo, setEventInfo] = useState(null);
  const [eventPositionSearch, setEventPositionSearch] = useState("");

  const listEvent = async () => {
    try {
      const response = await event.methods.listEvent().call();
      setEvents(response);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSearchEvent = async (e) => {
    e.preventDefault();
    try {
      const response = await event.methods
        .events(parseInt(eventPositionSearch) - 1)
        .call();

      setEventInfo(response);
    } catch (error) {
      setEventInfo(null);
      console.log(error);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      setLoadingCreateEvent(true);
      const contas = await web3.eth.getAccounts();
      const response = await event.methods
        .createEvent(name, description, date, parseInt(price), parseInt(ticketCount))
        .send({ from: contas[0] });
      console.log(response);
      setLoadingCreateEvent(false);
    } catch (error) {
      setLoadingCreateEvent(false);
      alert("Ops, erro no cadastro do evento");
      console.log(error);
    }
  };
  const handleBuyEvent = async (e) => {
    e.preventDefault();
    try {
      setLoadingBuyEvent(true);
      const contas = await web3.eth.getAccounts();
      const response = await event.methods
        .buyTicket(parseInt(eventPosition) - 1, parseInt(quantity))
        .send({
          from: contas[0],
          value: parseInt(events[parseInt(eventPosition) - 1].price * quantity),
        });

      console.log(response);
      setLoadingBuyEvent(false);
    } catch (error) {
        setLoadingBuyEvent(false);
      alert("Ops, erro no cadastro do evento");
      console.log(error);
    }
  };
  useEffect(() => {
    listEvent();
  }, []);
  return (
    <div>
      <h1>Contrato de Eventos</h1>
      <div className="divider" />
      <h2>Listagem de Eventos</h2>
      <table>
        <thead>
          <tr>
            <th>id</th>
            <th>Nome do Evento</th>
            <th>Descrição do Evento</th>
            <th>Data</th>
            <th>Valor do Ingresso (WEI)</th>
            <th>Ingressos Disponíveis</th>
          </tr>
        </thead>
        <tbody>
          {/* Mostra informação das leituras */}
          {events.map((event, idx) => (
            <tr key={idx}>
              <td>{idx + 1}</td>
              <td>{event.name}</td>
              <td>{event.description}</td>
              <td>{converteHorario(parseInt(event.date))}</td>
              <td>{event.price}</td>
              <td>{event.ticketCount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {!(events.length > 0) ? (
        <h4>Nenhuma leitura cadastrada no servidor</h4>
      ) : null}

      <br />
      <br />
      <div className="divider" />
      <form onSubmit={handleCreateEvent}>
        <div className="content">
          <h2>Cadastro de Eventos</h2>
          <div className="formulario">
            <input
              placeholder="Digite o nome do evento"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              placeholder="Digite a descrição do evento"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <input
              placeholder="Digite a data do evento"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <input
              placeholder="Digite o preço do ingresso"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <input className="descricao"
              placeholder="Digite a quantidade de ingressos"
              value={ticketCount}
              onChange={(e) => setTicketCount(e.target.value)}
            />
          <button type="submit">Cadastrar</button>
          </div>
          
          {loadingCreateEvent ? (
            <h5>Processando cadastro de evento...</h5>
          ) : (
            <>
              <br />
              <br />
            </>
          )}
        </div>
      </form>

      <div className="divider" />
      <form onSubmit={handleBuyEvent}>
        <div className="content">
          <h2>Comprar Ingresso</h2>
          <br/>
          <div className="formulario">
            <input
              placeholder="Digite o id do evento"
              value={eventPosition}
              onChange={(e) => setEventPosition(e.target.value)}
            />
            <input
              placeholder="Digite a quantidade de ingressos"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
            <button type="submit">Comprar</button>
          </div>
          {loadingBuyEvent ? (
            <h5>Processando compra de ingresso...</h5>
          ) : (
            <>
              <br />
              <br />
            </>
          )}
        </div>
      </form>
      <div className="divider" />
      <form onSubmit={handleSearchEvent}>
        <div className="content">
          <h2>Mostrar informações de um evento</h2>

          <div className="formulario">
            <input
              placeholder="Digite o id do evento"
              value={eventPositionSearch}
              onChange={(e) => setEventPositionSearch(e.target.value)}
            />
            <button type="submit">Buscar</button>
          </div>
          {eventInfo ? (
            <div>
              <p>
                <b>Nome do Evento:</b> {eventInfo.name}
              </p>
              <p>
                <b>Descrição:</b> {eventInfo.description}
              </p>
              <p>
                <b>Data:</b> {converteHorario(parseInt(eventInfo.date))}
              </p>
              <p>
                <b>Preço do Ingresso:</b> {eventInfo.price} wei
              </p>
            </div>
          ) : null}
        </div>
        </form>
      <br />
      <br />
    </div>
  );
}

export default Home;