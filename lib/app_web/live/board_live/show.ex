defmodule AppWeb.BoardLive.Show do
  use AppWeb, :live_view

  alias App.Boards
  alias App.Boards.Events
  alias AppWeb.BoardLive.Components.Card
  alias App.Cards

  @impl true
  def mount(%{"id" => board_id}, _session, socket) do
    if connected?(socket) do
      Boards.subscribe_to_board(board_id)
    end

    {:ok, socket |> assign(width: 2000, height: 2000, board_id: board_id, current_card: nil)}
  end

  @impl Phoenix.LiveView
  def render(assigns) do
    ~H"""
    <main class="relative">
      <svg
        id="edges"
        class="absolute top-0 left-0"
        style={"width: #{@width}px; height: #{@height}px;"}
        phx-update="stream"
      >
        <g id="unconnected-connector">
          <path
            class="pointer-events-all cursor-pointer fill-none stroke-black stroke-[6px] hidden"
            shape-rendering="geometric-precision"
          />
        </g>
        <%= for {id, edge} <- @streams.edges do %>
          <g
            data-edge-id={edge.id}
            data-next-node-id={edge.next_node_id}
            data-previous-node-id={edge.previous_node_id}
            id={id}
            phx-hook="CardConnector"
          >
            <path
              class="pointer-events-all cursor-pointer fill-none stroke-black stroke-[6px]"
              shape-rendering="geometric-precision"
            />
          </g>
        <% end %>
      </svg>
      <div
        class="absolute top-0 left-0"
        id="board"
        phx-hook="Board"
        phx-update="stream"
        style={"width: #{@width}px; height: #{@height}px;"}
      >
        <%= for {id, card} <- @streams.cards do %>
          <div>
            <Card.render id={id} card={card} />
          </div>
        <% end %>
        <.live_component
          module={AppWeb.BoardLive.Components.CardEdit}
          id="card-edit-modal"
          card={@current_card}
        />
      </div>
    </main>
    """
  end

  @impl Phoenix.LiveView
  def handle_params(%{"id" => id}, _, socket) do
    {:noreply,
     socket
     |> assign(:page_title, page_title(socket.assigns.live_action))
     |> assign(:board, Boards.get_board!(id))
     |> stream(:cards, Cards.list_cards_for_board(id))
     |> stream(:edges, Cards.list_edges_for_board(id))}
  end

  @impl Phoenix.LiveView
  def handle_event(
        "user-clicked-board",
        %{"data" => data},
        %{assigns: %{current_card: nil}} = socket
      ) do
    data
    |> Map.put("board_id", socket.assigns.board.id)
    |> Cards.create_card()
    |> case do
      {:ok, card} ->
        {:noreply, socket |> assign(current_card: card)}

      _ ->
        {:noreply, socket}
    end
  end

  def handle_event("user-clicked-board", _, socket) do
    {:noreply, socket |> assign(current_card: nil)}
  end

  def handle_event("card-drag-end", %{"data" => %{"id" => id} = params}, socket) do
    Cards.get_card!(id)
    |> Cards.move_card(params)

    {:noreply, socket}
  end

  def handle_event("card-clicked", %{"data" => %{"id" => card_id}}, socket) do
    {:noreply, socket |> assign(current_card: Cards.get_card!(card_id))}
  end

  def handle_event("card-edit:click-away", _unsigned_params, socket) do
    {:noreply, socket |> assign(current_card: nil)}
  end

  def handle_event(
        "card-connected",
        %{
          "data" => new_edge_attrs
        },
        socket
      ) do
    new_edge_attrs
    |> Map.put("board_id", socket.assigns.board.id)
    |> Cards.create_edge()

    {:noreply, socket}
  end

  def handle_event("create-card-with-connection", %{"data" => data}, socket) do
    data
    |> Map.put("board_id", socket.assigns.board.id)
    |> Boards.create_card_with_connection()
    |> case do
      {:ok, %{card: card}} ->
        {:noreply, socket |> assign(current_card: card)}

      _ ->
        {:noreply, socket}
    end
  end

  @impl Phoenix.LiveView
  def handle_info({Boards, %Events.CardCreated{card: card}}, socket) do
    {:noreply, socket |> stream_insert(:cards, card)}
  end

  def handle_info({Boards, %Events.CardMoved{card: card}}, socket) do
    {:noreply, socket |> stream_insert(:cards, card)}
  end

  def handle_info({Boards, %Events.CardUpdated{card: card}}, socket) do
    {:noreply, socket |> stream_insert(:cards, card)}
  end

  def handle_info({Boards, %Events.EdgeCreated{edge: edge}}, socket) do
    {:noreply, socket |> stream_insert(:edges, edge)}
  end

  defp page_title(:show), do: "Show Board"
  defp page_title(:edit), do: "Edit Board"
end
