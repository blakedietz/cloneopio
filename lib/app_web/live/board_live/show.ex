defmodule AppWeb.BoardLive.Show do
  use AppWeb, :live_view

  alias App.Boards

  @impl true
  def mount(_params, _session, socket) do
    {:ok, socket |> assign(width: 2000, height: 2000)}
  end

  @impl Phoenix.LiveView
  def render(assigns) do
    ~H"""
    <main class="relative">
      <div style={"width: #{@width}px; height: #{@height}px;"} />
      <svg class="absolute top-0 left-0" style={"width: #{@width}px; height: #{@height}px;"}></svg>
    </main>
    """
  end

  @impl true
  def handle_params(%{"id" => id}, _, socket) do
    {:noreply,
     socket
     |> assign(:page_title, page_title(socket.assigns.live_action))
     |> assign(:board, Boards.get_board!(id))}
  end

  defp page_title(:show), do: "Show Board"
  defp page_title(:edit), do: "Edit Board"
end
