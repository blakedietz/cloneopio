defmodule AppWeb.BoardLive.Components.Card do
  use Phoenix.Component

  def render(assigns) do
    ~H"""
    <div
      id={@id}
      class="card"
      style={"left: #{@card.x}px; top: #{@card.y}px;"}
      data-card-id={"#{@card.id}"}
      phx-hook="Card"
    >
      <div class="w-full">
        <%= @card.notes %>
      </div>
      <div
        id={"card-connector-#{@card.id}"}
        class="card-connector w-[20px] flex flex-col h-full p-1 cursor-pointer"
      >
        <button class="rounded-full border-white border-2 p-1 h-[20px] w-[20px]" />
      </div>
    </div>
    """
  end
end
