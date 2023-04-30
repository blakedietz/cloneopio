defmodule AppWeb.BoardLive.Components.CardEdit do
  use AppWeb, :live_component

  alias App.Cards
  alias App.Boards

  @offset_px 10

  @impl Phoenix.LiveComponent
  def update(%{card: nil} = assigns, socket) do
    {:ok, socket |> assign(assigns) |> assign(is_visible: false)}
  end

  def update(assigns, socket) do
    {:ok,
     socket
     |> assign(assigns)
     |> assign(
       form: assigns.card |> Cards.change_card() |> to_form(),
       is_visible: true,
       offset_px: @offset_px
     )}
  end

  @impl Phoenix.LiveComponent
  def render(assigns) do
    assigns =
      assigns
      |> assign_new(:style, fn
        %{card: nil} ->
          ""

        %{card: card} ->
          "left: #{card.x + @offset_px}px; top: #{card.y + @offset_px}px;"
      end)
      |> assign_new(:card_id, fn
        %{card: nil} ->
          "card-edit-fallback-id"

        %{card: card} ->
          card.id
      end)
      |> assign_new(:class, fn
        %{card: nil} ->
          "hidden"

        _ ->
          "z-20 min-h-[30px] min-w-[90px] absolute bg-zinc-400 rounded-md select-none p-1 pointer-events-auto"
      end)

    ~H"""
    <div
      class={@class}
      data-card-id={@card_id}
      id={@id}
      phx-hook="CardEdit"
      data-is-visible={"#{@is_visible}"}
      style={@style}
    >
      <div :if={@is_visible}>
        <.form
          for={@form}
          phx-change="card-edit:update"
          phx-submit="card-edit:save"
          phx-target={@myself}
        >
          <.input
            id={"#{@form[:notes].id}-#{@card.id}"}
            type="textarea"
            phx-mounted={JS.focus(to: "##{@form[:notes].id}-#{@card.id}")}
            maxlength="3000"
            phx-debounce="300"
            field={@form[:notes]}
          />
        </.form>
        <button
          phx-click="click-delete-card"
          phx-target={@myself}
          phx-value-card-id={@card_id}
          class="bg-rose-500 hover:bg-rose-400 text-white font-bold py-2 px-4 border-b-2 border-r-2 border-rose-700 hover:border-rose-500 rounded m-1 active:border-opacity-0"
        >
          <.icon name="hero-trash" class="h-4 w-4" />
        </button>
      </div>
    </div>
    """
  end

  @impl Phoenix.LiveComponent
  def handle_event("card-edit:update", %{"card" => card}, socket) do
    Cards.update_card(socket.assigns.card, card)
    {:noreply, socket}
  end

  def handle_event("click-delete-card", %{"card-id" => card_id}, socket) do
    Boards.delete_card_and_connections!(card_id)
    {:noreply, socket}
  end
end
