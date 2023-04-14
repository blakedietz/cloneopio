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
      <svg class="absolute top-0 left-0" style={"width: #{@width}px; height: #{@height}px;"}></svg>
      <div
        class="card absolute top-0 left-0"
        style={"width: #{@width}px; height: #{@height}px;"}
        phx-hook="Board"
        id="board"
        phx-update="stream"
      >
        <%= for {id, card} <- @streams.cards do %>
          <Card.render id={id} card={card} />
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
     |> stream(:cards, Cards.list_cards_for_board(id))}
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

    {:noreply, socket}
  end

  def handle_event("user-clicked-board", _, socket) do
    {:noreply, socket |> assign(current_card: nil)}
  end

  def handle_event("card-drag-end", %{"data" => %{"id" => id} = params}, socket) do
    Cards.get_card!(id)
    |> Cards.move_card(params)
    |> case do
      {:ok, _} ->
        {:noreply, socket}

      _ ->
        {:noreply, socket}
    end
  end

  def handle_event("card-clicked", %{"data" => %{"id" => card_id}}, socket) do
    {:noreply, socket |> assign(current_card: Cards.get_card!(card_id))}
  end

  def handle_event("card-edit:click-away", _unsigned_params, socket) do
    {:noreply, socket |> assign(current_card: nil)}
  end

  @impl Phoenix.LiveView
  def handle_info({Boards, %Events.CardCreated{card: card}}, socket) do
    {:noreply, socket |> stream_insert(:cards, card)}
  end

  def handle_info({Boards, %Events.CardMoved{card: card}}, socket) do
    {:noreply, socket |> stream_insert(:cards, card)}
  end

  def handle_info({Boards, %Events.CardUpdated{card: card}}, socket) do
    {:noreply, socket |> stream_insert(:cards, card) |> assign(current_card: card)}
  end

  defp page_title(:show), do: "Show Board"
  defp page_title(:edit), do: "Edit Board"
end
