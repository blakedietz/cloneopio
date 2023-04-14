defmodule AppWeb.BoardLive.Components.CardEdit do
  use AppWeb, :live_component

  alias App.Cards

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
          "min-h-[30px] min-w-[90px] absolute bg-gray-500 rounded-md select-none"
      end)

    ~H"""
    <div class={@class} data-card-id={@card_id} id={@id} phx-hook="CardEdit" style={@style}>
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
      </div>
    </div>
    """
  end

  @impl Phoenix.LiveComponent
  def handle_event("card-edit:update", %{"card" => card}, socket) do
    Cards.update_card(socket.assigns.card, card)
    {:noreply, socket}
  end
end
