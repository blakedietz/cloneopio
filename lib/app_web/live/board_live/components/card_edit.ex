defmodule AppWeb.BoardLive.Components.CardEdit do
  use AppWeb, :live_component

  alias App.Cards

  @offset_px 10

  @impl Phoenix.LiveComponent
  def update(%{card: nil}, socket) do
    {:ok, socket |> assign(is_visible: false)}
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
  def render(%{is_visible: false} = assigns) do
    ~H"""
    <div class="hidden"></div>
    """
  end

  def render(assigns) do
    ~H"""
    <div
      id={@id}
      class="min-h-[30px] min-w-[90px] absolute bg-gray-500 rounded-md select-none"
      style={"left: #{@card.x + @offset_px}px; top: #{@card.y + @offset_px}px;"}
      data-card-id={"#{@card.id}"}
    >
      <.form for={@form} phx-change="validate" phx-submit="save" phx-target={@myself}>
        <.input
          id={"#{@card.id}-#{@form[:notes].id}"}
          type="textarea"
          maxlength="3000"
          field={@form[:notes]}
        />
      </.form>
    </div>
    """
  end

  @impl Phoenix.LiveComponent
  def handle_event("validate", _unsigned_params, socket) do
    {:noreply, socket}
  end
end
