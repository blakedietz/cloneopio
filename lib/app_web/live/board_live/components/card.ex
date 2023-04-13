defmodule AppWeb.BoardLive.Components.Card do
  use Phoenix.Component

  def render(assigns) do
    ~H"""
    <div
      id={@id}
      class="min-h-[30px] min-w-[90px] absolute bg-gray-500 rounded-md select-none"
      style={"left: #{@card.x}px; top: #{@card.y}px;"}
      data-card-id={"#{@card.id}"}
      phx-hook="Card"
    >
      <div><%= @card.notes %></div>
    </div>
    """
  end
end
