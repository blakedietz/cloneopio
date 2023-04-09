defmodule AppWeb.BoardLive.Show do
  use AppWeb, :live_view

  alias App.Boards
  alias App.Cards

  @impl true
  def mount(%{"id" => board_id}, _session, socket) do
    {:ok, socket |> assign(width: 2000, height: 2000, board_id: board_id)}
  end

  @impl Phoenix.LiveView
  def render(assigns) do
    ~H"""
    <main class="relative" phx-hook="Board" id="board">
      <div style={"width: #{@width}px; height: #{@height}px;"} />
      <svg class="absolute top-0 left-0" style={"width: #{@width}px; height: #{@height}px;"}></svg>
    </main>
    """
  end

  @impl Phoenix.LiveView
  def handle_params(%{"id" => id}, _, socket) do
    {:noreply,
     socket
     |> assign(:page_title, page_title(socket.assigns.live_action))
     |> assign(:board, Boards.get_board!(id))}
  end

  @impl Phoenix.LiveView
  def handle_event("user-clicked-board", %{"data" => data}, socket) do
    data
    |> Map.put("board_id", socket.assigns.board.id)
    |> Cards.create_card()
    |> IO.inspect()
    |> case do
      {:ok, card} ->
        {:noreply, socket |> push_event("new-card-added", %{card: card})}

      {:error, _} ->
        {:noreply, socket}
    end
  end

  defp page_title(:show), do: "Show Board"
  defp page_title(:edit), do: "Edit Board"
end
